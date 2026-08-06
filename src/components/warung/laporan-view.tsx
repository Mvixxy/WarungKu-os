"use client";

import { useState } from "react";
import { Download, Printer, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/components/providers/app-state-provider";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCompactCurrency, formatCurrency, formatDate } from "@/lib/format";
import { buildSeries, estimateProductVelocity, ReportRange, summarizeReport } from "@/lib/reporting";

export function LaporanView() {
  const { transactions, expenses, products, settings } = useAppState();
  const [range, setRange] = useState<ReportRange>("harian");

  const summary = summarizeReport(range, transactions, expenses);
  const series = buildSeries(range, transactions);
  const topVelocity = estimateProductVelocity(products, transactions)
    .sort((left, right) => right.sold - left.sold)
    .slice(0, 4);
  const highestValue = Math.max(...series.map((item) => item.revenue), 1);

  const rangeLabel =
    range === "harian" ? "Hari ini" : range === "mingguan" ? "Minggu ini" : "Bulan ini";

  return (
    <div className="space-y-3">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Omzet"
          value={formatCompactCurrency(summary.revenue)}
          description={`Total pemasukan periode ${rangeLabel.toLowerCase()}.`}
        />
        <StatCard
          title="Laba kotor"
          value={formatCompactCurrency(summary.grossProfit)}
          description="Penjualan dikurangi modal barang."
          tone="accent"
        />
        <StatCard
          title="Pengeluaran"
          value={formatCompactCurrency(summary.expenseTotal)}
          description="Biaya operasional periode ini."
        />
        <StatCard
          title="Laba bersih"
          value={formatCompactCurrency(summary.netProfit)}
          description="Hasil akhir setelah semua dikurangi."
          tone="warn"
        />
      </section>

      <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="font-heading text-lg">Ringkasan performa</CardTitle>
              <CardDescription>
                Ganti periode untuk baca ritme omzet warung.
              </CardDescription>
            </div>

            <Tabs value={range} onValueChange={(value) => setRange(value as ReportRange)}>
              <TabsList className="rounded-lg p-0.5">
                <TabsTrigger value="harian" className="rounded-md px-3 text-xs">Harian</TabsTrigger>
                <TabsTrigger value="mingguan" className="rounded-md px-3 text-xs">Mingguan</TabsTrigger>
                <TabsTrigger value="bulanan" className="rounded-md px-3 text-xs">Bulanan</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Tren omzet</p>
                  <p className="mt-1 font-heading text-2xl font-semibold">{formatCurrency(summary.revenue)}</p>
                </div>
                <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                  {summary.transactionCount} transaksi
                </span>
              </div>

              <div className="mt-4 flex h-40 items-end gap-2">
                {series.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-primary/80"
                        style={{
                          height: `${Math.max(12, (item.revenue / highestValue) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-medium">{item.label}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {formatCompactCurrency(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2.5 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-3.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Rata-rata tiket</p>
                <p className="mt-1 font-heading text-xl font-semibold">
                  {formatCurrency(summary.averageTicket)}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Per transaksi periode {rangeLabel.toLowerCase()}.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Produk paling laris</p>
                <div className="mt-2 space-y-1.5">
                  {topVelocity.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <span className="text-xs font-medium">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">{item.sold} terjual</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-heading text-lg">Preview laporan PDF</CardTitle>
              <CardDescription className="text-xs">
                Layout printable untuk kebutuhan cetak.
              </CardDescription>
            </div>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs"
                onClick={() =>
                  toast.info("Mode print belum diaktifkan.", {
                    description: "Layout sudah disiapkan.",
                  })
                }
              >
                <Printer className="size-3" />
                Print
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-lg text-xs"
                onClick={() =>
                  toast.info("Cetak PDF masih placeholder.", {
                    description: "Akan dihubungkan ke generator PDF.",
                  })
                }
              >
                <Download className="size-3" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-muted/30 p-4 ring-1 ring-border">
              <div className="flex items-start justify-between gap-3 border-b border-dashed border-border pb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-primary font-medium">Warung OS report</p>
                  <h3 className="mt-1 font-heading text-lg font-semibold">{settings.storeName}</h3>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {[settings.storeTagline, settings.city].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{settings.storeAddress}</p>
                </div>
                <div className="rounded-lg bg-sidebar px-3 py-2 text-right text-sidebar-foreground">
                  <p className="text-[9px] uppercase tracking-wider text-sidebar-foreground/60">{rangeLabel}</p>
                  <p className="mt-0.5 font-heading text-base font-semibold">{formatCurrency(summary.netProfit)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-dashed border-border py-3">
                <div className="rounded-lg bg-card border border-border p-2.5">
                  <p className="text-[10px] text-muted-foreground">Omzet</p>
                  <p className="mt-0.5 text-sm font-semibold">{formatCurrency(summary.revenue)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-2.5">
                  <p className="text-[10px] text-muted-foreground">Pengeluaran</p>
                  <p className="mt-0.5 text-sm font-semibold">{formatCurrency(summary.expenseTotal)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-2.5">
                  <p className="text-[10px] text-muted-foreground">Laba kotor</p>
                  <p className="mt-0.5 text-sm font-semibold">{formatCurrency(summary.grossProfit)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-2.5">
                  <p className="text-[10px] text-muted-foreground">Rata-rata transaksi</p>
                  <p className="mt-0.5 text-sm font-semibold">{formatCurrency(summary.averageTicket)}</p>
                </div>
              </div>

              <div className="space-y-2 py-3">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <TrendingUp className="size-3 text-primary" />
                  Catatan untuk pemilik warung
                </div>
                <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                  <li className="rounded-lg bg-card border border-border px-2.5 py-2">
                    Laba bersih periode {rangeLabel.toLowerCase()}: {formatCurrency(summary.netProfit)}.
                  </li>
                  <li className="rounded-lg bg-card border border-border px-2.5 py-2">
                    Produk terlaris: {topVelocity.map((item) => item.name).join(", ")}.
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-border pt-3 text-[10px] text-muted-foreground">
                <span>Disusun otomatis oleh Warung OS</span>
                <span>{formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
