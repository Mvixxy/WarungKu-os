"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  Menu,
  Package2,
  ScrollText,
  Settings2,
  ShoppingBasket,
  Store,
  Wallet,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AccountPanel } from "@/components/auth/account-panel";
import { AIAssistantPanel } from "@/components/warung/ai-assistant-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useAppState } from "@/components/providers/app-state-provider";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/kasir", label: "Kasir", icon: ShoppingBasket },
  { href: "/inventaris", label: "Inventaris", icon: Package2 },
  { href: "/buku-hutang", label: "Buku Hutang", icon: Wallet },
  { href: "/laporan", label: "Laporan", icon: ScrollText },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings2 },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard operasional warung",
    subtitle:
      "Lihat angka penting, stok menipis, dan aktivitas terbaru tanpa mengganggu layar kasir.",
  },
  "/kasir": {
    title: "Kasir cepat untuk jam sibuk",
    subtitle:
      "Layar ini khusus untuk jualan cepat: pilih produk, atur jumlah, dan selesaikan transaksi.",
  },
  "/inventaris": {
    title: "Kontrol stok tanpa buku catatan",
    subtitle:
      "Pantau produk aktif, restok cepat, dan sorot barang yang mulai menipis.",
  },
  "/buku-hutang": {
    title: "Catatan kasbon yang rapi",
    subtitle:
      "Simpan pelanggan berhutang, kirim pengingat, dan tandai pelunasan dengan satu klik.",
  },
  "/laporan": {
    title: "Laporan untung yang gampang dipahami",
    subtitle:
      "Lihat omzet, pengeluaran, dan preview PDF untuk kebutuhan pinjaman atau evaluasi usaha.",
  },
  "/pengaturan": {
    title: "Pengaturan warung",
    subtitle:
      "Atur profil warung, notifikasi stok menipis, dan metode bayar yang ingin ditampilkan.",
  },
};

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { settings, transactions } = useAppState();
  const activePage = pageTitles[pathname] ?? pageTitles["/kasir"];
  const [aiOpen, setAiOpen] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  useEffect(() => {
    if (aiOpen) setLeftCollapsed(true);
  }, [aiOpen]);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="mx-auto flex h-full w-full max-w-[1600px] gap-2 p-2 lg:gap-3 lg:p-3">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[width] duration-200 ease-out lg:flex",
            leftCollapsed ? "w-[72px] items-center px-3 py-4" : "w-[260px] p-4",
          )}
        >
          {leftCollapsed ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-4" />
            </div>
          ) : (
            <div className="rounded-xl bg-sidebar px-4 py-3 text-sidebar-foreground">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Store className="size-4" />
                </div>
                <p className="truncate text-sm font-medium">
                  {settings.storeName}
                </p>
              </div>
              <ThemeToggle className="mt-3" />
            </div>
          )}

          <Button
            variant="ghost"
            size={leftCollapsed ? "default" : "icon-sm"}
            onClick={() => setLeftCollapsed((v) => !v)}
            disabled={aiOpen}
            aria-label={leftCollapsed ? "Buka sidebar" : "Tutup sidebar"}
            title={
              aiOpen
                ? "Sidebar otomatis tertutup saat Asisten AI aktif"
                : leftCollapsed
                  ? "Buka sidebar"
                  : "Tutup sidebar"
            }
            className={cn(
              "mt-2 rounded-lg",
              leftCollapsed ? "size-10 p-0" : "self-end",
            )}
          >
            {leftCollapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <ChevronsLeft className="size-4" />
            )}
          </Button>

          <nav
            className={cn(
              "mt-2 flex-1 overflow-y-auto",
              leftCollapsed
                ? "flex flex-col items-center gap-1"
                : "space-y-1",
            )}
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={leftCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150",
                    leftCollapsed ? "size-10 justify-center" : "px-3 py-2.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className={cn("shrink-0", leftCollapsed ? "size-[18px]" : "size-4")} />
                  {!leftCollapsed && item.label}
                </Link>
              );
            })}
          </nav>

          {!leftCollapsed && <AccountPanel />}
        </aside>

        {/* Mobile Sidebar */}
        <div className="pointer-events-none fixed top-3 left-3 z-40 lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-lg"
                  className="pointer-events-auto rounded-xl bg-card shadow-sm backdrop-blur"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] bg-sidebar text-sidebar-foreground"
            >
              <SheetHeader className="px-6 pt-6">
                <SheetTitle className="text-sidebar-foreground">
                  {settings.storeName}
                </SheetTitle>
                <SheetDescription className="text-sidebar-foreground/70">
                  {activePage.title}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-1 px-4 pb-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        buttonVariants({
                          variant: isActive ? "secondary" : "ghost",
                          size: "lg",
                        }),
                        "w-full justify-start rounded-xl",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/auth"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-4 h-10 w-full rounded-xl",
                  )}
                >
                  Akun
                </Link>
                <ThemeToggle className="mt-4" />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto pt-14 lg:pt-0">
          {children}
        </main>

        <AIAssistantPanel open={aiOpen} onOpenChange={setAiOpen} />
      </div>
    </div>
  );
}
