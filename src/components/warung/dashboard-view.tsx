"use client";

import { AlertTriangle, ArrowRightLeft, Clock3, ReceiptText, WalletCards } from "lucide-react";
import { useAppState } from "@/components/providers/app-state-provider";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime, formatTime } from "@/lib/format";

export function DashboardView() {
  const { debts, lowStockProducts, products, transactions } = useAppState();

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
  const latestTransaction = transactions[0] ?? null;
  const latestDebts = debts.slice(0, 4);

  return (
    <div className="space-y-3 sm:space-y-4">
      <section className="grid gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Omzet hari ini"
          value={formatCurrency(todaySales)}
          description="Akumulasi transaksi yang sudah masuk sejak pagi."
        />
        <StatCard
          title="Transaksi hari ini"
          value={`${todayTransactions.length} transaksi`}
          description="Ringkasan cepat untuk memantau ritme kasir."
          tone="accent"
        />
        <StatCard
          title="Stok menipis"
          value={`${lowStockProducts.length} item`}
          description="Barang yang mulai rawan kosong dan sebaiknya segera dicek."
          tone="warn"
        />
        <StatCard
          title="Kasbon aktif"
          value={formatCurrency(outstandingDebt)}
          description="Total piutang pelanggan yang belum lunas."
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
                <p className="mt-3 text-[10px] sm:text-xs text-primary-foreground/60">
                  Belum ada transaksi yang tersimpan.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="size-3 sm:size-3.5 text-primary" />
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide">Timeline transaksi</p>
              </div>
              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-start justify-between gap-2 sm:gap-3 rounded-lg bg-muted px-2.5 py-2 sm:px-3 sm:py-2.5"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-medium">{formatCurrency(transaction.total)}</p>
                      <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
                        {transaction.items.length} produk • {transaction.paymentMethod}
                      </p>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                ))}
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
                <div className="rounded-xl bg-accent/10 px-3 py-4 text-xs text-accent-foreground">
                  Semua stok aman. Belum ada produk yang menyentuh batas minimum.
                </div>
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
              {latestDebts.map((debt) => (
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
                    <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
                      {debt.isPaid ? "Lunas" : "Belum lunas"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between gap-3 sm:gap-4 px-3 py-3 sm:p-4">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">SKU aktif</p>
                <p className="mt-1 font-heading text-lg sm:text-2xl font-semibold">{products.length} produk</p>
              </div>
              <div className="flex size-8 sm:size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Clock3 className="size-3.5 sm:size-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
