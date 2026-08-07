"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquareShare, Search, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/components/providers/app-state-provider";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { DebtDraft } from "@/lib/types";

const emptyDraft: DebtDraft = {
  borrowerName: "",
  whatsapp: "",
  amount: 0,
  dueDate: new Date().toISOString().slice(0, 10),
};

export function BukuHutangView() {
  const { debts, addDebt, markDebtPaid, sendDebtReminder } = useAppState();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"semua" | "belum" | "lunas">("semua");
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<DebtDraft>(emptyDraft);

  const filteredDebts = debts.filter((debt) => {
    const keyword = query.toLowerCase();
    const matchesKeyword =
      debt.borrowerName.toLowerCase().includes(keyword) ||
      debt.whatsapp.includes(keyword);
    const matchesStatus =
      status === "semua" ||
      (status === "belum" && !debt.isPaid) ||
      (status === "lunas" && debt.isPaid);
    return matchesKeyword && matchesStatus;
  });

  const outstandingTotal = debts
    .filter((debt) => !debt.isPaid)
    .reduce((sum, debt) => sum + debt.amount, 0);
  const paidCount = debts.filter((debt) => debt.isPaid).length;
  const reminderCount = debts.filter((debt) => debt.lastReminderAt).length;

  async function handleCreateDebt() {
    try {
      if (
        draft.borrowerName.trim().length === 0 ||
        draft.whatsapp.trim().length < 10 ||
        draft.amount <= 0
      ) {
        toast.error("Lengkapi nama, nomor WA, dan nominal hutang.");
        return;
      }
      await addDebt(draft);
      setCreateOpen(false);
      setDraft(emptyDraft);
      toast.success("Kasbon berhasil disimpan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan kasbon.");
    }
  }

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        <StatCard
          title="Kasbon aktif"
          value={formatCurrency(outstandingTotal)}
          description="Total piutang yang masih perlu ditagih."
        />
        <StatCard
          title="Sudah lunas"
          value={`${paidCount} pelanggan`}
          description="Pelanggan yang sudah menyelesaikan pembayaran."
          tone="accent"
        />
        <StatCard
          title="Pengingat terkirim"
          value={`${reminderCount} kali`}
          description="Notifikasi WA yang sudah dipicu."
          tone="warn"
        />
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="font-heading text-lg">Buku hutang pelanggan</CardTitle>
            <CardDescription>
              Catat kasbon, kirim pengingat, dan tandai pelunasan.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama atau WA..."
                className="h-9 rounded-lg border-border bg-muted/50 pl-8 text-sm"
              />
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger
                render={<Button size="sm" className="h-9 rounded-lg" />}
              >
                <WalletCards className="size-3.5 sm:size-4" />
                Tambah kasbon
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-xl p-0">
                <DialogHeader className="p-4 pb-0">
                  <DialogTitle className="font-heading text-lg">Catat hutang baru</DialogTitle>
                  <DialogDescription className="text-xs">
                    Simpan data pelanggan dan nominal hutang.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 p-4 pt-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="borrower-name" className="text-xs">Nama peminjam</Label>
                    <Input
                      id="borrower-name"
                      value={draft.borrowerName}
                      onChange={(event) => setDraft({ ...draft, borrowerName: event.target.value })}
                      className="h-9 rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="borrower-wa" className="text-xs">Nomor WhatsApp</Label>
                    <Input
                      id="borrower-wa"
                      value={draft.whatsapp}
                      onChange={(event) => setDraft({ ...draft, whatsapp: event.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="h-9 rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="borrower-amount" className="text-xs">Nominal hutang</Label>
                      <Input
                        id="borrower-amount"
                        type="number"
                        min={0}
                        value={draft.amount}
                        onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value) })}
                        className="h-9 rounded-lg text-sm"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="borrower-due-date" className="text-xs">Jatuh tempo</Label>
                      <Input
                        id="borrower-due-date"
                        type="date"
                        value={draft.dueDate}
                        onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
                        className="h-9 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="rounded-b-xl px-4 pb-4" showCloseButton>
                  <Button type="button" size="sm" className="rounded-lg" onClick={() => void handleCreateDebt()}>
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Tabs value={status} onValueChange={(value) => setStatus(value as typeof status)}>
            <TabsList className="rounded-lg p-0.5">
              <TabsTrigger value="semua" className="rounded-md px-3 text-xs">
                Semua
              </TabsTrigger>
              <TabsTrigger value="belum" className="rounded-md px-3 text-xs">
                Belum lunas
              </TabsTrigger>
              <TabsTrigger value="lunas" className="rounded-md px-3 text-xs">
                Lunas
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-2.5 lg:grid-cols-2">
            {filteredDebts.map((debt) => (
              <Card key={debt.id} className="p-0">
                <CardContent className="space-y-2.5 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-heading text-sm font-semibold">{debt.borrowerName}</p>
                      <p className="text-xs text-muted-foreground">{debt.whatsapp}</p>
                    </div>
                    <Badge
                      variant={debt.isPaid ? "secondary" : "default"}
                      className="rounded-full text-[10px] sm:text-xs px-2 py-0.5"
                    >
                      {debt.isPaid ? "Lunas" : "Belum lunas"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted/50 p-2.5">
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Nominal</p>
                      <p className="mt-0.5 text-sm font-semibold">{formatCurrency(debt.amount)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5">
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Jatuh tempo</p>
                      <p className="mt-0.5 text-sm font-semibold">{formatDate(debt.dueDate)}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-2 text-[10px] sm:text-xs text-muted-foreground">
                    Dicatat: {formatDateTime(debt.createdAt)} · Pengingat: {debt.lastReminderAt ? formatDateTime(debt.lastReminderAt) : "Belum"}
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-md text-xs"
                      onClick={async () => {
                        try {
                          const reminded = await sendDebtReminder(debt.id);
                          if (reminded) {
                            toast.success("Pengingat terkirim.", {
                              description: `Pesan untuk ${reminded.borrowerName}.`,
                            });
                          }
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Gagal kirim pengingat.");
                        }
                      }}
                    >
                      <MessageSquareShare className="size-3 sm:size-3.5" />
                      Kirim
                    </Button>
                    {!debt.isPaid && (
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 rounded-md text-xs"
                        onClick={async () => {
                          try {
                            await markDebtPaid(debt.id);
                            toast.success(`${debt.borrowerName} lunas.`);
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Gagal.");
                          }
                        }}
                      >
                        <CheckCircle2 className="size-3 sm:size-3.5" />
                        Lunas
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
