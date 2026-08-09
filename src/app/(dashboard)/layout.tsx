import Script from "next/script";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script src="/register-sw.js" strategy="lazyOnload" />
      {children}
    </>
  );
}
