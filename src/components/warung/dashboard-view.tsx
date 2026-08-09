"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRightLeft, Ban, Loader2, Package2, ReceiptText, Search, ShoppingBasket, WalletCards } from "lucide-react";
import { useAppState } from "@/components/providers/app-state-provider";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/lib/types";
import { formatCurrency, formatDateTime, formatTime } from "@/lib/format";
import { toast } from "sonner";

export function DashboardView() {
  const { debts, lowStockProducts, products, transactions, voidTransaction, loadMoreTransactions, loadMoreDebts } = useAppState();

  const todayTransactions = transactions.filter((transaction) => {
    const value = new Date(transaction.createdAt);
    const now = new Date();
    return value.toDateString() === now.toDateString();
  });

  const todaySales = todayTransactions.reduce(
    (sum, transaction) => sum + transaction.total,
    0
  );
  const outstandingDebt = debts
    .filter((debt) => !debt.isPaid)
    .reduce((sum, debt) => sum + debt.amount, 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [voidTarget, setVoidTarget] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidLoading, setVoidLoading] = useState(false);
  const filteredTransactions = searchQuery
    ? transactions.filter((t) =>
        t.items?.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions;
  const latestTransaction = transactions[0] ?? null;

  async function handleVoid() {
    if (!voidTarget) return;
    setVoidLoading(true);
    try {
      await voidTransaction(voidTarget, voidReason);
      setVoidTarget(null);
      setVoidReason("");
      toast.success("Transaksi dibatalkan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membatalkan.");
    } finally {
      setVoidLoading(false);
    }
  }

  const latestDebts = debts.slice(0, 4);

  return (
    <div className="space-y-3 sm:space-y-4">
      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <StatCard
          title="Omzet hari ini"
          value={formatCurrency(todaySales)}
          description="Akumulasi transaksi yang sudah masuk sejak pagi."
          href="/laporan"
        />
        <StatCard
          title="Transaksi hari ini"
          value={`${todayTransactions.length} transaksi`}
          description="Ringkasan cepat untuk memantau ritme kasir."
          tone="accent"
          href="/kasir"
        />
        <StatCard
          title="Stok menipis"
          value={`${lowStockProducts.length} item`}
          description="Barang yang mulai rawan kosong dan sebaiknya segera dicek."
          tone="warn"
          href="/inventaris"
        />
        <StatCard
          title="Kasbon aktif"
          value={formatCurrency(outstandingDebt)}
          description="Total piutang pelanggan yang belum lunas."
          href="/buku-hutang"
        />
      </section>

      <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="font-heading text-base sm:text-xl">Aktivitas terbaru</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Semua ringkasan yang sebelumnya membuat layar kasir terasa penuh dipindahkan ke sini.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-xl bg-primary p-3 text-primary-foreground sm:p-4">
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <ReceiptText className="size-3 sm:size-3.5" />
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide">Transaksi terakhir</p>
              </div>

              {latestTransaction ? (
                <>
                  <p className="mt-2 font-heading text-xl sm:text-3xl font-semibold sm:mt-3">
                    {formatCurrency(latestTransaction.total)}
                  </p>
                  <p className="mt-1 text-[10px] sm:text-xs text-primary-foreground/60">
                    {latestTransaction.paymentMethod} • {formatTime(latestTransaction.createdAt)}
                  </p>
                  <div className="mt-3 space-y-1.5 sm:space-y-2">
                    {latestTransaction.items.map((item) => (
                      <div
                        key={`${latestTransaction.id}-${item.productId}`}
                        className="flex items-center justify-between text-[10px] sm:text-xs"
                      >
                        <span className="text-primary-foreground/80">
                          {item.productName} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-3 flex flex-col items-center text-center">
                  <p className="text-xs text-primary-foreground/60">Belum ada transaksi hari ini.</p>
                  <Link href="/kasir">
                    <Button variant="secondary" size="sm" className="mt-3 h-8 rounded-lg text-xs">
                      <ShoppingBasket className="size-3" />
                      Mulai jualan
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="size-3 sm:size-3.5 text-primary" />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide">Timeline transaksi</p>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-7 w-36 rounded-lg border border-border bg-background pl-7 pr-2 text-xs"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
                {transactions.length > 0 ? (
                  filteredTransactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      onClick={() => setSelectedTx(transaction)}
                      className={`flex items-start justify-between gap-2 sm:gap-3 rounded-lg px-2.5 py-2 sm:px-3 sm:py-2.5 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all ${
                        transaction.voided ? "bg-destructive/5 border border-destructive/20" : "bg-muted"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs sm:text-sm font-medium ${transaction.voided ? "line-through text-muted-foreground" : ""}`}>
                            {formatCurrency(transaction.total)}
                          </p>
                          {transaction.voided && (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0">Dibatalkan</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
                          {transaction.items.length} produk • {transaction.paymentMethod}
                          {transaction.voidReason && ` • ${transaction.voidReason}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!transaction.voided && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setVoidTarget(transaction.id); }}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Batalkan transaksi"
                          >
                            <Ban className="size-3" />
                          </button>
                        )}
                        <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    searchQuery ? "Tidak ada transaksi yang cocok." : "Belum ada riwayat transaksi."
                  </div>
                )}
                {transactions.length > 5 && (
                  <button
                    type="button"
                    onClick={async () => {
                      setLoadingMore(true);
                      try { await loadMoreTransactions(); } finally { setLoadingMore(false); }
                    }}
                    disabled={loadingMore}
                    className="w-full pt-2 text-xs text-primary hover:underline disabled:text-muted-foreground"
                  >
                    {loadingMore ? (<><Loader2 className="mr-1 inline size-3 animate-spin" />Memuat data...</>) : "Muat lebih banyak transaksi..."}
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2.5 sm:space-y-3">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-heading text-base sm:text-xl">Stok perlu perhatian</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Cocok dibuka sebelum restok atau saat mau tutup toko.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 sm:space-y-2">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-2.5 py-2 sm:px-3 sm:py-2.5"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <AlertTriangle className="size-3 sm:size-3.5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{product.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full text-[10px] sm:text-xs">
                      {product.stock} / min {product.minimumStock}
                    </Badge>
                  </div>
                ))
              ) : (
                <Link href="/inventaris" className="block">
                  <div className="rounded-xl border border-dashed border-accent/30 bg-accent/5 px-3 py-4 text-center">
                    <Package2 className="mx-auto size-5 text-accent/50" />
                    <p className="mt-1.5 text-xs text-accent-foreground/70">Semua stok aman.</p>
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="font-heading text-base sm:text-xl">Kasbon terbaru</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Ringkas untuk follow-up pelanggan tanpa masuk ke halaman penuh buku hutang.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 sm:space-y-2">
              {latestDebts.length > 0 ? (
                latestDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className="flex items-start justify-between gap-2 sm:gap-3 rounded-xl border border-border bg-card px-2.5 py-2 sm:px-3 sm:py-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <WalletCards className="size-3 sm:size-3.5 text-primary" />
                        <p className="text-xs sm:text-sm font-medium">{debt.borrowerName}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">{debt.whatsapp}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-medium">{formatCurrency(debt.amount)}</p>
                      <Badge
                        variant={debt.isPaid ? "secondary" : "destructive"}
                        className="mt-0.5 rounded-full text-[9px] sm:text-[10px]"
                      >
                        {debt.isPaid ? "Lunas" : "Belum lunas"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <Link href="/buku-hutang" className="block">
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center">
                    <WalletCards className="mx-auto size-5 text-muted-foreground/50" />
                    <p className="mt-1.5 text-xs text-muted-foreground">Belum ada catatan kasbon.</p>
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between gap-3 sm:gap-4 px-3 py-3 sm:p-4">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">SKU aktif</p>
                <p className="mt-1 font-heading text-lg sm:text-2xl font-semibold">{products.length} produk</p>
              </div>
              <Link href="/inventaris">
                <div className="flex size-8 sm:size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                  <Package2 className="size-3.5 sm:size-4" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={!!voidTarget} onOpenChange={(open) => { if (!open) { setVoidTarget(null); setVoidLoading(false); } }}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
                <Ban className="size-4 text-destructive" />
              </span>
              Batalkan transaksi?
            </DialogTitle>
            <DialogDescription>
              Transaksi akan ditandai dibatalkan dan stok akan dikembalikan. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="void-reason" className="text-[10px]">Alasan (opsional)</Label>
            <Input
              id="void-reason"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Contoh: Salah input"
              className="h-9 rounded-lg text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setVoidTarget(null)} disabled={voidLoading}>Batal</Button>
            <Button variant="destructive" size="sm" className="rounded-lg" onClick={() => void handleVoid()} disabled={voidLoading}>
              {voidLoading ? <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Membatalkan...</> : "Ya, batalkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => { if (!open) setSelectedTx(null); }}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>{selectedTx && formatDateTime(selectedTx.createdAt)}</DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedTx.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Pembayaran</p>
                  <p className="text-sm font-medium">{selectedTx.paymentMethod}</p>
                </div>
              </div>
              {selectedTx.voided && (
                <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                  Dibatalkan{selectedTx.voidReason ? `: ${selectedTx.voidReason}` : ""}
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Item yang dibeli</p>
                <div className="space-y-1.5">
                  {selectedTx.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-card border border-border px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-[10px] text-muted-foreground">{formatCurrency(item.unitPrice)} x {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
                <span>{selectedTx.items.length} item</span>
                <span>{selectedTx.items.reduce((sum, i) => sum + i.quantity, 0)} produk</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => { if (!open) setSelectedTx(null); }}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>{selectedTx && formatDateTime(selectedTx.createdAt)}</DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedTx.total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Pembayaran</p>
                  <p className="text-sm font-medium">{selectedTx.paymentMethod}</p>
                </div>
              </div>
              {selectedTx.voided && (
                <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                  Dibatalkan{selectedTx.voidReason ? `: ${selectedTx.voidReason}` : ""}
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Item yang dibeli</p>
                <div className="space-y-1.5">
                  {selectedTx.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-card border border-border px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-[10px] text-muted-foreground">{formatCurrency(item.unitPrice)} x {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
                <span>{selectedTx.items.length} item</span>
                <span>{selectedTx.items.reduce((sum, i) => sum + i.quantity, 0)} produk</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
