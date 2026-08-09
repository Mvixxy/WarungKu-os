import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Script from "next/script";
import { AppShell } from "@/components/app-shell";
import { auth } from "@/lib/auth";

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

  return (
    <>
      <Script src="/register-sw.js" strategy="lazyOnload" />
      <AppShell>{children}</AppShell>
    </>
  );
}
