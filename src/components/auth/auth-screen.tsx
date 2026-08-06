"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, KeyRound, ShieldCheck, Store, Loader2 } from "lucide-react";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

export function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = useSession();
  const queryMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const authError = searchParams.get("error");
  const [authErrMsg, setAuthErrMsg] = useState(authError || "");
  const [mode, setMode] = useState<AuthMode>(queryMode);
  const [submitting, setSubmitting] = useState(false);
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (!isSessionPending && session) router.replace("/dashboard");
  }, [isSessionPending, router, session]);

  useEffect(() => {
    setMode(queryMode);
  }, [queryMode]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="default" className="bg-card shadow-sm" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo + branding */}
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Store className="size-5" />
          </div>
          <h1 className="mt-4 font-heading text-xl font-semibold tracking-tight">
            WarungKu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola warung jadi lebih gampang.
          </p>
        </div>

        {/* Auth card */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          {/* Mode toggle */}
          <div className="flex rounded-lg bg-muted p-0.5">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-md py-2 text-xs font-medium transition-colors",
                mode === "signin"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setMode("signin")}
            >
              Masuk
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-md py-2 text-xs font-medium transition-colors",
                mode === "signup"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setMode("signup")}
            >
              Daftar
            </button>
          </div>

          {authErrMsg && (
            <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {authErrMsg}
            </div>
          )}

          {mode === "signin" ? (
            <>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-xs">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    form="signin-form"
                    type="email"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm((c) => ({ ...c, email: e.target.value }))}
                    autoComplete="email"
                    className="h-9 rounded-lg text-sm"
                    placeholder="email@warung.com"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password" className="text-xs">Kata sandi</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    form="signin-form"
                    type="password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm((c) => ({ ...c, password: e.target.value }))}
                    autoComplete="current-password"
                    className="h-9 rounded-lg text-sm"
                    placeholder="Masukkan sandi"
                    required
                  />
                </div>
                <Button
                  type="button"
                  className="h-10 w-full rounded-lg text-sm"
                  disabled={submitting}
                  onClick={async () => {
                    setSubmitting(true);
                    setAuthErrMsg("");
                    try {
                      const res = await signIn.email({
                        email: signInForm.email,
                        password: signInForm.password,
                      });
                      if (res.error) {
                        setAuthErrMsg(res.error.message || "Email atau sandi salah.");
                      } else {
                        router.replace("/dashboard");
                      }
                    } catch {
                      setAuthErrMsg("Gagal terhubung ke server.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? (<><Loader2 className="mr-2 size-3.5 animate-spin" />Masuk...</>) : (<>Masuk<ArrowRight className="size-3.5" /></>)}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-xs">Nama pemilik</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    form="signup-form"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm((c) => ({ ...c, name: e.target.value }))}
                    autoComplete="name"
                    className="h-9 rounded-lg text-sm"
                    placeholder="Contoh: Pak Budi"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    form="signup-form"
                    type="email"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm((c) => ({ ...c, email: e.target.value }))}
                    autoComplete="email"
                    className="h-9 rounded-lg text-sm"
                    placeholder="email@warung.com"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs">Kata sandi</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    form="signup-form"
                    type="password"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm((c) => ({ ...c, password: e.target.value }))}
                    autoComplete="new-password"
                    className="h-9 rounded-lg text-sm"
                    placeholder="Minimal 8 karakter"
                    minLength={8}
                    required
                  />
                </div>
                <Button
                  type="button"
                  className="h-10 w-full rounded-lg text-sm"
                  disabled={submitting}
                  onClick={async () => {
                    setSubmitting(true);
                    setAuthErrMsg("");
                    try {
                      const res = await signUp.email({
                        name: signUpForm.name,
                        email: signUpForm.email,
                        password: signUpForm.password,
                      });
                      if (res.error) {
                        setAuthErrMsg(res.error.message || "Gagal membuat akun.");
                      } else {
                        router.replace("/dashboard");
                      }
                    } catch {
                      setAuthErrMsg("Gagal terhubung ke server.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? (<><Loader2 className="mr-2 size-3.5 animate-spin" />Membuat akun...</>) : (<>Buat akun<ArrowRight className="size-3.5" /></>)}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <ShieldCheck className="size-3" />
            <span>Login aman</span>
          </div>
          <div className="flex items-center gap-1">
            <KeyRound className="size-3" />
            <span>Data tersinkronisasi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
