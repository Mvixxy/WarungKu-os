"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/format";

export function AccountPanel() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Berhasil keluar.");
      router.refresh();
      router.push("/auth");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal keluar.");
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
        variant="ghost"
        size="sm"
        className="mt-2 h-7 w-full rounded-md text-xs text-muted-foreground hover:text-foreground"
        onClick={() => void handleSignOut()}
      >
        <LogOut className="size-3" />
        Keluar
      </Button>
    </div>
  );
}
