"use client";

import { useState } from "react";
import { Download, Printer, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useAppState } from "@/components/providers/app-state-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Expense } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCompactCurrency, formatCurrency, formatDate } from "@/lib/format";
import { buildSeries, estimateProductVelocity, getRangeStart, ReportRange, summarizeReport } from "@/lib/reporting";

export function LaporanView() {
  const { transactions, expenses, products, settings, addExpense, updateExpense, deleteExpense } = useAppState();
  const [range, setRange] = useState<ReportRange>("harian");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseDraft, setExpenseDraft] = useState<{ title: string; amount: string; category: "Operasional" | "Belanja" | "Utilitas" }>({ title: "", amount: "", category: "Operasional" });

  const summary = summarizeReport(range, transactions, expenses);
  const periodStart = getRangeStart(range);
  const filteredExpenses = expenses.filter((e) => new Date(e.createdAt) >= periodStart);
  const series = buildSeries(range, transactions);
  const topVelocity = estimateProductVelocity(products, transactions)
    .sort((left, right) => right.sold - left.sold)
    .slice(0, 4);

  const rangeLabel =
    range === "harian" ? "Hari ini" : range === "mingguan" ? "Minggu ini" : "Bulan ini";

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editDraft, setEditDraft] = useState<{ title: string; amount: string; category: "Operasional" | "Belanja" | "Utilitas" }>({ title: "", amount: "", category: "Operasional" });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<Expense | null>(null);
  const [deleteExpenseLoading, setDeleteExpenseLoading] = useState(false);
  const [expenseRange, setExpenseRange] = useState<ReportRange | "semua">("semua");

  const handleAddExpense = async () => {
    if (!expenseDraft.title.trim() || !expenseDraft.amount) return;
    setExpenseLoading(true);
    try {
      await addExpense({ title: expenseDraft.title.trim(), amount: Number(expenseDraft.amount), category: expenseDraft.category });
      setExpenseDraft({ title: "", amount: "", category: "Operasional" });
      setExpenseOpen(false);
      toast.success("Pengeluaran tercatat.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mencatat pengeluaran.");
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleEditExpense = async () => {
    if (!editingExpense || !editDraft.title.trim() || !editDraft.amount) return;
    setEditLoading(true);
    try {
      await updateExpense(editingExpense.id, { title: editDraft.title.trim(), amount: Number(editDraft.amount), category: editDraft.category });
      setEditingExpense(null);
      toast.success("Pengeluaran diperbarui.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpenseTarget) return;
    setDeleteExpenseLoading(true);
    try {
      await deleteExpense(deleteExpenseTarget.id);
      setDeleteExpenseTarget(null);
      toast.success("Pengeluaran dihapus.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus.");
    } finally {
      setDeleteExpenseLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
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

      <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-heading text-lg">Daftar pengeluaran</CardTitle>
              <CardDescription className="text-xs">Klik ikon untuk edit atau hapus.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={expenseRange} onValueChange={(value) => setExpenseRange(value as ReportRange | "semua")}>
                <TabsList className="rounded-lg p-0.5">
                  <TabsTrigger value="semua" className="rounded-md px-2.5 text-[10px] sm:text-xs">Semua</TabsTrigger>
                  <TabsTrigger value="harian" className="rounded-md px-2.5 text-[10px] sm:text-xs">Harian</TabsTrigger>
                  <TabsTrigger value="mingguan" className="rounded-md px-2.5 text-[10px] sm:text-xs">Mingguan</TabsTrigger>
                  <TabsTrigger value="bulanan" className="rounded-md px-2.5 text-[10px] sm:text-xs">Bulanan</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-lg text-xs no-print shrink-0"
                onClick={() => setExpenseOpen(true)}
              >
                + Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const expenseStart = expenseRange === "semua" ? null : getRangeStart(expenseRange);
              const displayExpenses = expenseStart
                ? expenses.filter((e) => new Date(e.createdAt) >= expenseStart)
                : expenses;
              return displayExpenses.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">
                  {expenseRange === "semua" ? "Belum ada pengeluaran." : "Tidak ada pengeluaran di periode ini."}
                </p>
              ) : (
              <div className="space-y-2">
              {displayExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{expense.title}</p>
                    <p className="text-[10px] text-muted-foreground">{expense.category} · {formatDate(expense.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{formatCurrency(expense.amount)}</span>
                    <button
                      type="button"
                      onClick={() => { setEditingExpense(expense); setEditDraft({ title: expense.title, amount: String(expense.amount), category: expense.category }); }}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteExpenseTarget(expense)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
              );
            })()}
          </CardContent>
        </Card>

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

              <div className="mt-4 h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 8, right: 8, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5E3C" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#8B5E3C" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fontWeight: 600, fill: "hsl(var(--foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCompactCurrency(v)}
                      tick={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      width={65}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), "Omzet"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.12)",
                        padding: "10px 14px",
                        zIndex: 10,
                      }}
                      labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                    />
                    <Area
                      type="linear"
                      dataKey="revenue"
                      stroke="#8B5E3C"
                      strokeWidth={2.5}
                      fill="url(#colorRevenue)"
                      dot={{ r: 4, fill: "#8B5E3C", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                      activeDot={{ r: 6, fill: "#8B5E3C", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-2.5 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-3.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Rata-rata tiket</p>
                <p className="mt-1 font-heading text-xl font-semibold">
                  {formatCurrency(summary.averageTicket)}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
                  Per transaksi periode {rangeLabel.toLowerCase()}.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Produk paling laris</p>
                <div className="mt-2 space-y-1.5">
                  {topVelocity.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between">
                      <span className="text-xs font-medium">{item.name}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{item.sold} terjual</span>
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
                className="h-8 rounded-lg text-xs no-print"
                onClick={() => window.print()}
              >
                <Printer className="size-3 sm:size-3.5" />
                Print
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-lg text-xs no-print"
                onClick={() => window.print()}
              >
                <Download className="size-3 sm:size-3.5" />
                PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-muted/30 p-4 ring-1 ring-border">
              <div className="flex items-start justify-between gap-3 border-b border-dashed border-border pb-3">
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-primary font-medium">WarungKu report</p>
                  <h3 className="mt-1 font-heading text-lg font-semibold">{settings.storeName}</h3>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
                    {[settings.storeTagline, settings.city].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{settings.storeAddress}</p>
                </div>
                <div className="rounded-lg bg-primary px-3 py-2 text-right text-primary-foreground">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary-foreground/60">{rangeLabel}</p>
                  <p className="mt-0.5 font-heading text-base font-semibold">{formatCurrency(summary.netProfit)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-dashed border-border py-3">
                <div className="rounded-lg bg-card border border-border p-2.5">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Omzet</p>
                  <p className="mt-0.5 text-sm font-semibold">{formatCurrency(summary.revenue)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-2.5">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Pengeluaran</p>
                  <p className="mt-0.5 text-sm font-semibold">{formatCurrency(summary.expenseTotal)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-2.5">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Laba kotor</p>
                  <p className="mt-0.5 text-sm font-semibold">{formatCurrency(summary.grossProfit)}</p>
                </div>
                <div className="rounded-lg bg-card border border-border p-2.5">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Rata-rata transaksi</p>
                  <p className="mt-0.5 text-sm font-semibold">{formatCurrency(summary.averageTicket)}</p>
                </div>
              </div>

              <div className="space-y-2 py-3">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <TrendingUp className="size-3 text-primary" />
                  Catatan untuk pemilik warung
                </div>
                <ul className="space-y-1.5 text-[11px] sm:text-xs text-muted-foreground">
                  <li className="rounded-lg bg-card border border-border px-2.5 py-2">
                    Laba bersih periode {rangeLabel.toLowerCase()}: {formatCurrency(summary.netProfit)}.
                  </li>
                  <li className="rounded-lg bg-card border border-border px-2.5 py-2">
                    Produk terlaris: {topVelocity.map((item) => item.name).join(", ")}.
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-border pt-3 text-[10px] sm:text-xs text-muted-foreground">
                <span>Disusun otomatis oleh WarungKu</span>
                <span>{formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Expense Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={(open) => { if (!open) { setEditingExpense(null); setEditLoading(false); } }}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>Edit Pengeluaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-expense-title" className="text-[10px]">Judul</Label>
              <Input
                id="edit-expense-title"
                value={editDraft.title}
                onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-expense-amount" className="text-[10px]">Nominal (Rp)</Label>
              <Input
                id="edit-expense-amount"
                inputMode="numeric"
                value={editDraft.amount}
                onChange={(e) => setEditDraft({ ...editDraft, amount: e.target.value.replace(/[^0-9]/g, "") })}
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-expense-category" className="text-[10px]">Kategori</Label>
              <select
                id="edit-expense-category"
                value={editDraft.category}
                onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value as typeof editDraft.category })}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="Operasional">Operasional</option>
                <option value="Belanja">Belanja</option>
                <option value="Utilitas">Utilitas</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setEditingExpense(null)} disabled={editLoading}>Batal</Button>
            <Button size="sm" className="rounded-lg" onClick={() => void handleEditExpense()} disabled={!editDraft.title.trim() || !editDraft.amount || editLoading}>
              {editLoading ? <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menyimpan...</> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Expense Confirmation */}
      <Dialog open={!!deleteExpenseTarget} onOpenChange={(open) => { if (!open) { setDeleteExpenseTarget(null); setDeleteExpenseLoading(false); } }}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
                <Trash2 className="size-4 text-destructive" />
              </span>
              Hapus pengeluaran?
            </DialogTitle>
            <DialogDescription>
              &quot;{deleteExpenseTarget?.title}&quot; sebesar {formatCurrency(deleteExpenseTarget?.amount ?? 0)} akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setDeleteExpenseTarget(null)} disabled={deleteExpenseLoading}>Batal</Button>
            <Button variant="destructive" size="sm" className="rounded-lg" onClick={() => void handleDeleteExpense()} disabled={deleteExpenseLoading}>
              {deleteExpenseLoading ? <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menghapus...</> : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print-only report layout */}
      <div className="print-area hidden">
        <div style={{ fontFamily: "Inter, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ borderBottom: "2px solid #A05A28", paddingBottom: "16px", marginBottom: "24px" }}>
            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", color: "#A05A28", margin: 0 }}>WarungKu Report</p>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0" }}>{settings.storeName}</h1>
            <p style={{ fontSize: "12px", color: "#78716C", margin: 0 }}>
              {[settings.storeTagline, settings.city].filter(Boolean).join(" · ")}
            </p>
            <p style={{ fontSize: "12px", color: "#78716C", margin: 0 }}>{settings.storeAddress}</p>
            <p style={{ fontSize: "12px", color: "#78716C", marginTop: "4px" }}>Pemilik: {settings.ownerName} · {settings.ownerWhatsapp}</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#78716C", textTransform: "uppercase", margin: 0 }}>Periode</p>
              <p style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0" }}>{rangeLabel}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11px", color: "#78716C", textTransform: "uppercase", margin: 0 }}>Laba Bersih</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#A05A28", margin: "2px 0" }}>{formatCurrency(summary.netProfit)}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            <div style={{ border: "1px solid #E7E5E4", borderRadius: "8px", padding: "12px" }}>
              <p style={{ fontSize: "11px", color: "#78716C", margin: 0 }}>Omzet</p>
              <p style={{ fontSize: "16px", fontWeight: 600, margin: "4px 0 0" }}>{formatCurrency(summary.revenue)}</p>
            </div>
            <div style={{ border: "1px solid #E7E5E4", borderRadius: "8px", padding: "12px" }}>
              <p style={{ fontSize: "11px", color: "#78716C", margin: 0 }}>Pengeluaran</p>
              <p style={{ fontSize: "16px", fontWeight: 600, margin: "4px 0 0" }}>{formatCurrency(summary.expenseTotal)}</p>
            </div>
            <div style={{ border: "1px solid #E7E5E4", borderRadius: "8px", padding: "12px" }}>
              <p style={{ fontSize: "11px", color: "#78716C", margin: 0 }}>Laba Kotor</p>
              <p style={{ fontSize: "16px", fontWeight: 600, margin: "4px 0 0" }}>{formatCurrency(summary.grossProfit)}</p>
            </div>
            <div style={{ border: "1px solid #E7E5E4", borderRadius: "8px", padding: "12px" }}>
              <p style={{ fontSize: "11px", color: "#78716C", margin: 0 }}>Rata-rata Transaksi</p>
              <p style={{ fontSize: "16px", fontWeight: 600, margin: "4px 0 0" }}>{formatCurrency(summary.averageTicket)}</p>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Produk Terlaris</p>
            {topVelocity.map((item, i) => (
              <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #E7E5E4" }}>
                <span style={{ fontSize: "12px" }}>{i + 1}. {item.name}</span>
                <span style={{ fontSize: "12px", color: "#78716C" }}>{item.sold} terjual</span>
              </div>
            ))}
          </div>

          {expenses.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Pengeluaran</p>
              {expenses.map((expense) => (
                <div key={expense.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #E7E5E4" }}>
                  <span style={{ fontSize: "12px" }}>{expense.title} ({expense.category})</span>
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>{formatCurrency(expense.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px dashed #E7E5E4", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#78716C" }}>
            <span>Disusun otomatis oleh WarungKu</span>
            <span>{formatDate(new Date().toISOString())}</span>
          </div>
        </div>
      </div>

      <Dialog open={expenseOpen} onOpenChange={(open) => { setExpenseOpen(open); if (!open) setExpenseLoading(false); }}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>Catat Pengeluaran</DialogTitle>
            <DialogDescription>Isi detail pengeluaran warung Anda.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="expense-title" className="text-[10px]">Judul</Label>
              <Input
                id="expense-title"
                placeholder="contoh: Listrik bulanan"
                value={expenseDraft.title}
                onChange={(e) => setExpenseDraft({ ...expenseDraft, title: e.target.value })}
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="expense-amount" className="text-[10px]">Nominal (Rp)</Label>
              <Input
                id="expense-amount"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={expenseDraft.amount}
                onChange={(e) => setExpenseDraft({ ...expenseDraft, amount: e.target.value.replace(/[^0-9]/g, "") })}
                className="h-9 rounded-lg text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="expense-category" className="text-[10px]">Kategori</Label>
              <select
                id="expense-category"
                value={expenseDraft.category}
                onChange={(e) => setExpenseDraft({ ...expenseDraft, category: e.target.value as typeof expenseDraft.category })}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="Operasional">Operasional</option>
                <option value="Belanja">Belanja</option>
                <option value="Utilitas">Utilitas</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => { setExpenseOpen(false); setExpenseLoading(false); }}
              disabled={expenseLoading}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="rounded-lg"
              onClick={() => void handleAddExpense()}
              disabled={!expenseDraft.title.trim() || !expenseDraft.amount || expenseLoading}
            >
              {expenseLoading ? <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menyimpan...</> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
