"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Mail, LogOut, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function PendingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);

  // Check email verification status
  useEffect(() => {
    fetch("/api/verify/check")
      .then((r) => r.json())
      .then((data) => setEmailVerified(data.verified ?? false))
      .catch(() => setEmailVerified(false));
  }, []);

  // Poll every 10 seconds to check if approved
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/check");
        if (res.ok) {
          const data = await res.json();
          if (data.approved) {
            router.push("/dashboard");
            return;
          }
        }
      } catch {
        // Session expired or not logged in
      }
      setChecking(false);
    }, 10000);

    // Also check immediately
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((data) => {
        if (data.approved) {
          router.push("/dashboard");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));

    return () => clearInterval(interval);
  }, [router]);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/auth");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Clock className="size-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-xl font-semibold">Menunggu Persetujuan</h1>
            <p className="text-sm text-muted-foreground">
              Akun Anda sudah terdaftar. Silakan tunggu persetujuan dari admin WarungKu sebelum bisa menggunakan aplikasi.
            </p>
          </div>

          {/* Email verification status */}
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
            {emailVerified === null ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs text-muted-foreground">Mengecek verifikasi email...</span>
              </>
            ) : emailVerified ? (
              <>
                <CheckCircle2 className="size-4 text-green-600" />
                <span className="text-xs text-green-600 font-medium">Email sudah terverifikasi</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-amber-600" />
                <span className="text-xs text-amber-600 font-medium">Email belum diverifikasi</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => router.push("/verify")}
                >
                  Verifikasi sekarang
                </Button>
              </>
            )}
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 text-left">
            <p className="text-xs font-medium text-muted-foreground">Yang perlu Anda lakukan:</p>
            <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-medium text-primary">1.</span>
                <span>Verifikasi email Anda jika belum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-medium text-primary">2.</span>
                <span>Hubungi admin WarungKu via WhatsApp atau email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-medium text-primary">3.</span>
                <span>Minta persetujuan akun Anda</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 font-medium text-primary">4.</span>
                <span>Halaman ini akan otomatis refresh saat disetujui</span>
              </li>
            </ol>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Mail className="size-3.5" />
            <span>Halaman ini akan mengecek status otomatis setiap 10 detik</span>
          </div>

          {checking ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Mengecek status...
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => void handleLogout()}
            >
              <LogOut className="mr-1.5 size-3.5" />
              Keluar
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
