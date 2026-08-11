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
  LogOut,
  Settings2,
  ShoppingBasket,
  Sparkles,
  Store,
  Wallet,
  Shield,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AccountPanel } from "@/components/auth/account-panel";
import { AIAssistantPanel } from "@/components/warung/ai-assistant-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { useAppState } from "@/components/providers/app-state-provider";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/kasir", label: "Kasir", icon: ShoppingBasket },
  { href: "/inventaris", label: "Inventaris", icon: Package2 },
  { href: "/buku-hutang", label: "Hutang", icon: Wallet },
  { href: "/laporan", label: "Laporan", icon: ScrollText },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings2 },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

const bottomNav = [
  { href: "/dashboard", label: "Beranda", icon: Gauge },
  { href: "/inventaris", label: "Stok", icon: Package2 },
  { href: "/kasir", label: "Kasir", icon: ShoppingBasket, primary: true },
  { href: "/buku-hutang", label: "Hutang", icon: Wallet },
  { href: "/laporan", label: "Laporan", icon: ScrollText },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.isAdmin ?? false))
      .catch(() => {});
  }, []);

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
                ? "Sidebar otomatis tertutup saat Bu AIsyah aktif"
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
            {navigation.filter((item) => !("adminOnly" in item && item.adminOnly && !isAdmin)).map((item) => {
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

        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-2.5">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg"
                  />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] bg-sidebar text-sidebar-foreground"
              >
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <p className="text-sm font-semibold text-sidebar-foreground">{settings.storeName}</p>
                  <ThemeToggle />
                </div>
                <div className="flex flex-1 flex-col space-y-1 border-t border-sidebar-border px-4 pt-3 pb-6">
                  {navigation.filter((item) => !("adminOnly" in item && item.adminOnly && !isAdmin)).map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
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
                  <div className="mt-auto pt-4">
                    <div className="mb-3 border-t border-sidebar-border" />
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); setAiOpen(true); }}
                      className="flex h-11 w-full items-center gap-2 rounded-xl bg-primary/10 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                    >
                      <Sparkles className="size-4" />
                      Bu AIsyah
                    </button>
                    <div className="mb-3 border-t border-sidebar-border" />
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); setLogoutConfirmOpen(true); }}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" />
                      Keluar akun
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Store className="size-3.5" />
              </div>
              <p className="text-sm font-semibold tracking-tight">{settings.storeName}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Logout Confirmation Dialog */}
        {logoutConfirmOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <LogOut className="size-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Keluar akun?</p>
                  <p className="text-xs text-muted-foreground">Kamu akan kembali ke halaman login.</p>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setLogoutConfirmOpen(false); setLogoutLoading(false); }}
                  disabled={logoutLoading}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setLogoutLoading(true);
                    await signOut();
                    window.location.href = "/auth";
                  }}
                  disabled={logoutLoading}
                  className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
                >
                  {logoutLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Keluar...
                    </span>
                  ) : "Keluar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
          <div className="flex h-14 items-center justify-around px-1">
            {bottomNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isPrimary = (item as any).primary;
              if (isPrimary) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex h-full items-center"
                  >
                    <div className={cn(
                      "flex h-full items-center justify-center rounded-xl px-4 transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary font-semibold"
                        : "bg-muted text-muted-foreground",
                    )}>
                      <Icon className="size-5" strokeWidth={isActive ? 2.2 : 1.8} />
                    </div>
                  </Link>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={isActive ? 2.2 : 1.8} />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content — padded for mobile header + bottom nav */}
        <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto pt-[60px] pb-16 lg:pt-0 lg:pb-0">
          {children}
        </main>

        <AIAssistantPanel open={aiOpen} onOpenChange={setAiOpen} />
      </div>
    </div>
  );
}
