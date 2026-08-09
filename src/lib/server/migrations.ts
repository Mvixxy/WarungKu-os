import { pool } from "@/db/client";

/**
 * Versioned migration system for WarungKu OS.
 * 
 * Each migration runs exactly once. The schema_migrations table tracks
 * which migrations have been applied. New migrations are appended to the
 * MIGRATIONS array — never edit an existing migration.
 */

const MIGRATIONS: { version: number; name: string; sql: string }[] = [
  {
    version: 1,
    name: "init_schema",
    sql: `
      CREATE TABLE IF NOT EXISTS store_profiles (
        user_id text PRIMARY KEY,
        store_name text NOT NULL,
        store_tagline text NOT NULL DEFAULT '',
        store_address text NOT NULL DEFAULT '',
        owner_name text NOT NULL,
        owner_whatsapp text NOT NULL,
        city text NOT NULL,
        business_notes text NOT NULL DEFAULT '',
        stock_alert_threshold integer NOT NULL DEFAULT 5,
        enabled_payments jsonb NOT NULL DEFAULT '["Tunai","QRIS","Hutang"]'::jsonb,
        categories jsonb NOT NULL DEFAULT '["Sembako"]'::jsonb,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        name text NOT NULL,
        category text NOT NULL,
        buy_price integer NOT NULL,
        sell_price integer NOT NULL,
        stock integer NOT NULL DEFAULT 0,
        minimum_stock integer NOT NULL DEFAULT 5,
        description text NOT NULL DEFAULT '',
        image_url text,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        total integer NOT NULL,
        payment_method text NOT NULL,
        created_at timestamptz NOT NULL,
        voided integer NOT NULL DEFAULT 0,
        voided_at timestamptz,
        void_reason text
      );

      CREATE TABLE IF NOT EXISTS transaction_items (
        id text PRIMARY KEY,
        transaction_id text NOT NULL,
        product_id text NOT NULL,
        product_name text NOT NULL,
        quantity integer NOT NULL,
        unit_price integer NOT NULL,
        cost_price integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS debts (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        borrower_name text NOT NULL,
        whatsapp text NOT NULL,
        amount integer NOT NULL,
        paid_amount integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL,
        due_date timestamptz NOT NULL,
        is_paid integer NOT NULL DEFAULT 0,
        last_reminder_at timestamptz
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        title text NOT NULL,
        amount integer NOT NULL,
        created_at timestamptz NOT NULL,
        category text NOT NULL DEFAULT 'Operasional'
      );

      CREATE TABLE IF NOT EXISTS ai_chats (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        title text NOT NULL,
        created_at timestamptz NOT NULL,
        updated_at timestamptz NOT NULL
      );

      CREATE INDEX IF NOT EXISTS ai_chats_user_idx ON ai_chats(user_id, updated_at DESC);

      CREATE TABLE IF NOT EXISTS ai_messages (
        id text PRIMARY KEY,
        chat_id text NOT NULL,
        user_id text NOT NULL,
        role text NOT NULL,
        content text NOT NULL,
        tool_name text,
        tool_call_id text,
        tool_calls jsonb,
        tool_args jsonb,
        tool_result jsonb,
        created_at timestamptz NOT NULL
      );

      CREATE INDEX IF NOT EXISTS ai_messages_chat_idx ON ai_messages(chat_id, created_at);
    `,
  },
  {
    version: 2,
    name: "add_product_image_url",
    sql: `
      DO $$ BEGIN
        ALTER TABLE products ADD COLUMN image_url text;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `,
  },
];

export async function runMigrations() {
  // Ensure migration tracking table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version integer PRIMARY KEY,
      name text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT NOW()
    );
  `);

  // Get applied versions
  const { rows: applied } = await pool.query(
    "SELECT version FROM schema_migrations ORDER BY version"
  );
  const appliedVersions = new Set(applied.map((r: { version: number }) => r.version));

  // Run pending migrations in order
  for (const migration of MIGRATIONS) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    console.log(`[Migration] Running v${migration.version}: ${migration.name}`);
    await pool.query(migration.sql);
    await pool.query(
      "INSERT INTO schema_migrations (version, name) VALUES ($1, $2)",
      [migration.version, migration.name]
    );
    console.log(`[Migration] v${migration.version} applied successfully.`);
  }
}
