"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, Loader2, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if already verified
  useEffect(() => {
    fetch("/api/verify/check")
      .then((r) => r.json())
      .then((data) => {
        if (data.verified) {
          router.push("/pending");
        }
      })
      .catch(() => {});
  }, [router]);

  // Auto-send code on mount
  useEffect(() => {
    handleSendCode(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSendCode(silent = false) {
    if (cooldown > 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/verify/send", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal mengirim kode.");
      } else {
        if (!silent) toast.success("Kode verifikasi dikirim!");
        setCooldown(60);
      }
    } catch {
      toast.error("Gagal mengirim kode.");
    } finally {
      setSending(false);
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newCode.every((c) => c.length === 1)) {
      void handleVerify(newCode.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const newCode = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);

    // Focus last filled or next empty
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if 6 digits pasted
    if (pasted.length === 6) {
      void handleVerify(pasted);
    }
  }

  async function handleVerify(codeStr?: string) {
    const verifyCode = codeStr ?? code.join("");
    if (verifyCode.length !== 6) {
      toast.error("Masukkan kode 6 digit.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verify/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Kode tidak valid.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.success("Email berhasil diverifikasi!");
        setVerified(true);
        setTimeout(() => router.push("/pending"), 1500);
      }
    } catch {
      toast.error("Gagal verifikasi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await authClient.signOut();
    router.push("/auth");
  }

  if (verified) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <h1 className="font-heading text-xl font-semibold">Terverifikasi!</h1>
            <p className="text-sm text-muted-foreground">Mengalihkan ke halaman persetujuan...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="size-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-xl font-semibold">Verifikasi Email</h1>
            <p className="text-sm text-muted-foreground">
              Masukkan kode 6 digit yang dikirim ke email kamu.
            </p>
          </div>

          {/* Code Input */}
          <div className="flex justify-center gap-2">
            {code.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="h-12 w-12 rounded-lg text-center text-lg font-mono font-bold"
                disabled={loading}
              />
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Memverifikasi...
            </div>
          )}

          {/* Resend */}
          <div className="space-y-2">
            {cooldown > 0 ? (
              <p className="text-xs text-muted-foreground">
                Kirim ulang dalam {cooldown} detik
              </p>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                disabled={sending}
                onClick={() => void handleSendCode()}
              >
                <RefreshCw className={`mr-1 size-3 ${sending ? "animate-spin" : ""}`} />
                Kirim ulang kode
              </Button>
            )}
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
