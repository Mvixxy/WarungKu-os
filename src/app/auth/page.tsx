import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthScreen } from "@/components/auth/auth-screen";
import { auth } from "@/lib/auth";
import { getUserStatus, pgBool } from "@/lib/server/admin";
import { pool } from "@/db/client";

async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    const result = await pool.query<{ email_verified: unknown }>(
      'SELECT email_verified FROM "user" WHERE id = $1',
      [userId]
    );
    const row = result.rows[0];
    if (!row) return false;
    return pgBool(row.email_verified);
  } catch {
    return false;
  }
}

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    const verified = await isEmailVerified(session.user.id);
    if (!verified) {
      redirect("/verify");
    }

    const status = await getUserStatus(session.user.id);
    if (!status?.approved) {
      redirect("/pending");
    }
    redirect("/dashboard");
  }

  return <AuthScreen />;
}
