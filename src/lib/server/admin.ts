import { pool } from "@/db/client";
import { logger } from "./logger";

/**
 * Check if a user is approved and/or admin.
 * Returns { approved, isAdmin } or null if user not found.
 */
export async function getUserStatus(userId: string): Promise<{ approved: boolean; isAdmin: boolean } | null> {
  const result = await pool.query(
    "SELECT approved, is_admin FROM \"user\" WHERE id = $1",
    [userId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    approved: row.approved === true || row.approved === "true" || row.approved === 1,
    isAdmin: row.is_admin === true || row.is_admin === "true" || row.is_admin === 1,
  };
}

/**
 * Set a user as admin (by email). Only callable once.
 */
export async function promoteToAdmin(email: string): Promise<boolean> {
  const result = await pool.query(
    'UPDATE "user" SET is_admin = true, approved = true WHERE email = $1',
    [email]
  );
  if (result.rowCount && result.rowCount > 0) {
    logger.info("User promoted to admin", { email });
    return true;
  }
  return false;
}

/**
 * Approve a user by ID.
 */
export async function approveUser(userId: string): Promise<boolean> {
  const result = await pool.query(
    'UPDATE "user" SET approved = true WHERE id = $1',
    [userId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Reject/unapprove a user by ID.
 */
export async function unapproveUser(userId: string): Promise<boolean> {
  const result = await pool.query(
    'UPDATE "user" SET approved = false WHERE id = $1',
    [userId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Delete a user and all their data.
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Delete in order respecting foreign keys
    await client.query('DELETE FROM ai_messages WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM ai_chats WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM transaction_items WHERE transaction_id IN (SELECT id FROM transactions WHERE user_id = $1)', [userId]);
    await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM expenses WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM debts WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM products WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM store_profiles WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM session WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM account WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM "user" WHERE id = $1', [userId]);

    await client.query("COMMIT");
    logger.info("User deleted with all data", { userId });
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error("Failed to delete user", { userId, error: String(err) });
    return false;
  } finally {
    client.release();
  }
}

/**
 * Get all users with their data counts for admin monitoring.
 */
export async function getAllUsersWithStats() {
  const usersResult = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.created_at,
      u.approved,
      u.is_admin,
      COALESCE(p.product_count, 0) as product_count,
      COALESCE(t.transaction_count, 0) as transaction_count,
      COALESCE(d.debt_count, 0) as debt_count,
      COALESCE(e.expense_count, 0) as expense_count
    FROM "user" u
    LEFT JOIN (SELECT user_id, COUNT(*) as product_count FROM products GROUP BY user_id) p ON p.user_id = u.id
    LEFT JOIN (SELECT user_id, COUNT(*) as transaction_count FROM transactions GROUP BY user_id) t ON t.user_id = u.id
    LEFT JOIN (SELECT user_id, COUNT(*) as debt_count FROM debts WHERE is_paid = 0 GROUP BY user_id) d ON d.user_id = u.id
    LEFT JOIN (SELECT user_id, COUNT(*) as expense_count FROM expenses GROUP BY user_id) e ON e.user_id = u.id
    ORDER BY u.created_at DESC
  `);

  return usersResult.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    approved: row.approved === true || row.approved === "true" || row.approved === 1,
    isAdmin: row.is_admin === true || row.is_admin === "true" || row.is_admin === 1,
    stats: {
      products: Number(row.product_count),
      transactions: Number(row.transaction_count),
      debts: Number(row.debt_count),
      expenses: Number(row.expense_count),
    },
  }));
}

/**
 * Get system-wide stats.
 */
export async function getSystemStats() {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM "user") as total_users,
      (SELECT COUNT(*) FROM "user" WHERE approved = true) as approved_users,
      (SELECT COUNT(*) FROM "user" WHERE approved = false OR approved IS NULL) as pending_users,
      (SELECT COUNT(*) FROM products) as total_products,
      (SELECT COUNT(*) FROM transactions) as total_transactions,
      (SELECT COUNT(*) FROM debts WHERE is_paid = 0) as active_debts,
      (SELECT COALESCE(SUM(total), 0) FROM transactions) as total_revenue
  `);

  const row = result.rows[0];
  return {
    totalUsers: Number(row.total_users),
    approvedUsers: Number(row.approved_users),
    pendingUsers: Number(row.pending_users),
    totalProducts: Number(row.total_products),
    totalTransactions: Number(row.total_transactions),
    activeDebts: Number(row.active_debts),
    totalRevenue: Number(row.total_revenue),
  };
}
