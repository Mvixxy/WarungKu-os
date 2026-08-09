"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Bell, Loader2, MapPin, RotateCcw, Store, WalletCards } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAppState } from "@/components/providers/app-state-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { PaymentMethod, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

const paymentMethods: PaymentMethod[] = ["Tunai", "QRIS", "Hutang"];

export function PengaturanView() {
  const { settings, lowStockProducts, resetWorkspace, updateSettings, products } = useAppState();
  const [form, setForm] = useState<Settings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(settings);

  function updateField<Key extends keyof Settings>(field: Key, value: Settings[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function togglePayment(method: PaymentMethod) {
    const exists = form.enabledPayments.includes(method);
    updateField(
      "enabledPayments",
      exists
        ? form.enabledPayments.filter((item) => item !== method)
        : [...form.enabledPayments, method]
    );
  }

  async function handleSave() {
    try {
      if (
        form.storeName.trim().length === 0 ||
        form.storeAddress.trim().length === 0 ||
        form.ownerName.trim().length === 0 ||
        form.ownerWhatsapp.trim().length < 10 ||
        form.city.trim().length === 0 ||
        form.enabledPayments.length === 0
      ) {
        toast.error("Lengkapi semua data yang diperlukan.");
        return;
      }
      setIsSaving(true);
      await updateSettings(form);
      toast.success("Pengaturan berhasil disimpan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleWorkspaceReset() {
    try {
      setIsResetting(true);
      await resetWorkspace();
      setConfirmResetOpen(false);
      toast.success("Workspace dikembalikan ke kondisi awal.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal reset.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="grid gap-3 xl:grid-cols-[1.08fr_0.92fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="font-heading text-lg">Profil warung</CardTitle>
              <CardDescription className="text-xs">
                Atur identitas warung untuk dashboard dan laporan.
              </CardDescription>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-medium",
                hasUnsavedChanges
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/10 text-accent"
              )}
            >
              {hasUnsavedChanges ? "Belum disimpan" : "Sinkron"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-border p-3.5">
            <div className="flex items-center gap-1.5">
              <Store className="size-3.5 text-primary" />
              <p className="text-xs font-medium">Identitas warung</p>
            </div>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="store-name" className="text-[10px]">Nama warung</Label>
                <Input
                  id="store-name"
                  value={form.storeName}
                  onChange={(event) => updateField("storeName", event.target.value)}
                  className="h-8 rounded-lg text-sm"
                  placeholder="Warung Berkah"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="store-tagline" className="text-[10px]">Tagline</Label>
                <Input
                  id="store-tagline"
                  value={form.storeTagline}
                  onChange={(event) => updateField("storeTagline", event.target.value)}
                  className="h-8 rounded-lg text-sm"
                  placeholder="Sembako & kopi"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="city" className="text-[10px]">Kota</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className="h-8 rounded-lg text-sm"
                  placeholder="Depok"
                />
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <Label htmlFor="store-address" className="text-[10px]">Alamat</Label>
                <Textarea
                  id="store-address"
                  value={form.storeAddress}
                  onChange={(event) => updateField("storeAddress", event.target.value)}
                  className="min-h-16 rounded-lg text-sm"
                  placeholder="Jl. Mawar No. 8"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border p-3.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              <p className="text-xs font-medium">Pemilik</p>
            </div>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="owner-name" className="text-[10px]">Nama pemilik</Label>
                <Input
                  id="owner-name"
                  value={form.ownerName}
                  onChange={(event) => updateField("ownerName", event.target.value)}
                  className="h-8 rounded-lg text-sm"
                  placeholder="Bu Rani"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="owner-whatsapp" className="text-[10px]">WhatsApp</Label>
                <Input
                  id="owner-whatsapp"
                  value={form.ownerWhatsapp}
                  onChange={(event) => updateField("ownerWhatsapp", event.target.value)}
                  className="h-8 rounded-lg text-sm"
                  placeholder="081234567890"
                />
              </div>
              <div className="grid gap-1 sm:col-span-2">
                <Label htmlFor="business-notes" className="text-[10px]">Catatan bisnis</Label>
                <Textarea
                  id="business-notes"
                  value={form.businessNotes}
                  onChange={(event) => updateField("businessNotes", event.target.value)}
                  className="min-h-16 rounded-lg text-sm"
                  placeholder="Fokus stok tiap Senin pagi..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border p-3.5">
            <div className="flex items-center gap-1.5">
              <Bell className="size-3.5 text-primary" />
              <p className="text-xs font-medium">Batas stok alert</p>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={form.stockAlertThreshold}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  updateField("stockAlertThreshold", Number.isFinite(nextValue) ? nextValue : 0);
                }}
                className="h-8 w-24 rounded-lg text-sm"
              />
              <span className="text-xs text-muted-foreground">
                {lowStockProducts.length} produk di area peringatan
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border p-3.5">
            <div className="flex items-center gap-1.5">
              <WalletCards className="size-3.5 text-primary" />
              <p className="text-xs font-medium">Metode bayar</p>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {paymentMethods.map((method) => {
                const active = form.enabledPayments.includes(method);
                return (
                  <Button
                    key={method}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    className="h-7 rounded-md text-xs"
                    onClick={() => togglePayment(method)}
                  >
                    {method}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button
              type="button"
              size="sm"
              className="rounded-lg"
              onClick={() => void handleSave()}
              disabled={isSaving}
            >
              <BadgeCheck className="size-3.5 sm:size-4" />
              {isSaving ? (<><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menyimpan...</>) : "Simpan"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={() => setForm(settings)}
              disabled={!hasUnsavedChanges || isSaving}
            >
              Reset draft
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setConfirmResetOpen(true)}
            >
              <RotateCcw className="size-3.5 sm:size-4" />
              Reset workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Preview profil</CardTitle>
            <CardDescription className="text-xs">
              Ringkasan yang muncul di dashboard dan laporan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="rounded-xl bg-primary p-3.5 text-primary-foreground">
              <div className="flex items-center gap-1.5 text-primary-foreground/60">
                <Store className="size-3 text-sidebar-primary" />
                <p className="text-[10px] font-medium uppercase tracking-wide">Warung aktif</p>
              </div>
              <p className="mt-2 font-heading text-lg font-semibold">{form.storeName || "Nama warung"}</p>
              <p className="text-xs text-primary-foreground/60">
                {form.storeTagline || "Tagline"}
              </p>
              <div className="mt-2 space-y-0.5 text-[10px] text-primary-foreground/50">
                <p>{form.city || "Kota"} · {form.storeAddress || "Alamat"}</p>
                <p>Pemilik: {form.ownerName || "-"} · {form.ownerWhatsapp || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[10px] text-muted-foreground">Produk aktif</p>
                <p className="mt-0.5 font-heading text-lg font-semibold">{products.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[10px] text-muted-foreground">Batas alert</p>
                <p className="mt-0.5 font-heading text-lg font-semibold">{form.stockAlertThreshold} pcs</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-[10px] text-muted-foreground">Metode bayar</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {form.enabledPayments.map((method) => (
                  <span
                    key={method}
                    className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] sm:text-xs font-medium text-primary"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Acuan bisnis</CardTitle>
            <CardDescription className="text-xs">Estimasi modal stok aktif.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border bg-muted/30 p-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Estimasi modal</p>
              <p className="mt-1 font-heading text-xl font-semibold">
                {formatCurrency(
                  products.reduce((sum, product) => sum + product.buyPrice * product.stock, 0)
                )}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Bandingkan dengan omzet dari laporan.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={confirmResetOpen} onOpenChange={(open) => { setConfirmResetOpen(open); if (!open) setResetConfirmText(""); }}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-destructive">Reset Workspace?</DialogTitle>
            <DialogDescription>
              Semua data akan dihapus permanen: produk, transaksi, hutang, pengeluaran, dan pengaturan.
              Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reset-confirm" className="text-[10px]">
              Ketik <span className="font-mono font-semibold text-destructive">RESET</span> untuk konfirmasi
            </Label>
            <Input
              id="reset-confirm"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Ketik RESET"
              className="h-8 rounded-lg text-sm font-mono"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => setConfirmResetOpen(false)}
              disabled={isResetting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-lg"
              onClick={() => void handleWorkspaceReset()}
              disabled={isResetting || resetConfirmText !== "RESET"}
            >
              {isResetting ? (
                <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Mereset...</>
              ) : (
                <><RotateCcw className="mr-1.5 size-3.5" />Ya, reset semua</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
