import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Script from "next/script";
import { AppShell } from "@/components/app-shell";
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

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  const verified = await isEmailVerified(session.user.id);
  if (!verified) {
    redirect("/verify");
  }

  const status = await getUserStatus(session.user.id);
  if (!status?.approved) {
    redirect("/pending");
  }

  return (
    <>
      <Script src="/register-sw.js" strategy="lazyOnload" />
      <AppShell>{children}</AppShell>
    </>
  );
}
