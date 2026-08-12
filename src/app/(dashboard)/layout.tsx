import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Script from "next/script";
import { AppShell } from "@/components/app-shell";
import { auth } from "@/lib/auth";
import { getUserStatus, pgBool } from "@/lib/server/admin";
import { pool } from "@/db/client";

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

  // Check email verification
  const userResult = await pool.query<{ email_verified: unknown }>(
    'SELECT email_verified FROM "user" WHERE id = $1',
    [session.user.id]
  );
  const userRow = userResult.rows[0];

  if (userRow && !pgBool(userRow.email_verified)) {
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
