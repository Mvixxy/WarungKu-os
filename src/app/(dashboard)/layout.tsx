import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Script from "next/script";
import { AppShell } from "@/components/app-shell";
import { auth } from "@/lib/auth";
import { getUserStatus } from "@/lib/server/admin";

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
