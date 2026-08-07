"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/format";

export function AccountPanel() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      toast.success("Berhasil keluar.");
      router.refresh();
      router.push("/auth");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal keluar.");
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">Memuat sesi...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <span className="text-[10px] font-semibold">
              {getInitials(session.user.name || session.user.email || "WU")}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{session.user.name || "Pemilik Warung"}</p>
            <p className="truncate text-[10px] text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="mt-2 h-7 w-full rounded-md text-xs bg-destructive/10 text-destructive hover:bg-destructive/20"
          onClick={() => setConfirmOpen(true)}
        >
          <LogOut className="size-3" />
          Keluar
        </Button>
      </div>

      {confirmOpen && (
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
                onClick={() => { setConfirmOpen(false); setLoading(false); }}
                disabled={loading}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={loading}
                className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
              >
                {loading ? (
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
    </>
  );
}
