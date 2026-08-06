"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Store } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [mode, setMode] = useState<AuthMode>(queryMode);
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (!isSessionPending && session) router.replace("/dashboard");
  }, [isSessionPending, router, session]);

  useEffect(() => {
    setMode(queryMode);
  }, [queryMode]);

  return (
    <div className="relative min-h-screen bg-background px-4 py-6 lg:px-6">
      <div className="absolute top-4 right-4 z-10 lg:top-6 lg:right-6">
        <ThemeToggle variant="default" className="bg-card shadow-sm" />
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1200px] gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="relative overflow-hidden border-border bg-sidebar text-sidebar-foreground">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-6 lg:p-8">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-medium">Warung OS</p>
                  <p className="text-xs text-sidebar-foreground/60">Masuk untuk sinkronisasi warung</p>
                </div>
              </div>

              <h1 className="mt-6 max-w-md font-heading text-2xl font-semibold tracking-tight lg:text-3xl">
                Pembukuan, kasir, stok, dan kasbon dalam satu aplikasi.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-sidebar-foreground/60">
                Akun yang kamu buat akan membawa workspace warung sendiri di backend.
              </p>
            </div>

            <div className="grid gap-2.5">
              <div className="rounded-xl border border-sidebar-border bg-sidebar-accent p-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5 text-sidebar-primary" />
                  <p className="text-xs font-medium">Session aman</p>
                </div>
                <p className="mt-1.5 text-[11px] leading-5 text-sidebar-foreground/50">
                  Login logout pakai Better Auth, data tersambung ke API.
                </p>
              </div>
              <div className="rounded-xl border border-sidebar-border bg-sidebar-accent p-3.5">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-3.5 text-sidebar-primary" />
                  <p className="text-xs font-medium">Data langsung tersambung</p>
                </div>
                <p className="mt-1.5 text-[11px] leading-5 text-sidebar-foreground/50">
                  Bootstrap state otomatis memuat workspace user.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="font-heading text-xl">Akses akun</CardTitle>
            <CardDescription className="text-xs">
              Masuk atau buat akun baru untuk mulai mencatat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="inline-flex rounded-lg bg-muted p-0.5">
              <button
                type="button"
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
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
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  mode === "signup"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("signup")}
              >
                Daftar
              </button>
            </div>

            {authError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {authError}
              </div>
            )}

            {mode === "signin" ? (
              <>
                <div className="space-y-2.5">
                  <div className="grid gap-1">
                    <Label htmlFor="signin-email" className="text-xs">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      form="signin-form"
                      type="email"
                      value={signInForm.email}
                      onChange={(event) => setSignInForm((c) => ({ ...c, email: event.target.value }))}
                      autoComplete="email"
                      className="h-9 rounded-lg text-sm"
                      placeholder="warung@email.com"
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="signin-password" className="text-xs">Kata sandi</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      form="signin-form"
                      type="password"
                      value={signInForm.password}
                      onChange={(event) => setSignInForm((c) => ({ ...c, password: event.target.value }))}
                      autoComplete="current-password"
                      className="h-9 rounded-lg text-sm"
                      placeholder="Minimal 8 karakter"
                      required
                    />
                  </div>
                  <Button type="submit" form="signin-form" className="h-9 w-full rounded-lg text-sm">
                    Masuk
                  </Button>
                </div>
                <form id="signin-form" action="/api/session/sign-in" method="post">
                  <input type="hidden" name="callbackURL" value="/dashboard" />
                </form>
              </>
            ) : (
              <>
                <div className="space-y-2.5">
                  <div className="grid gap-1">
                    <Label htmlFor="signup-name" className="text-xs">Nama pemilik</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      form="signup-form"
                      value={signUpForm.name}
                      onChange={(event) => setSignUpForm((c) => ({ ...c, name: event.target.value }))}
                      autoComplete="name"
                      className="h-9 rounded-lg text-sm"
                      placeholder="Ibu Sari"
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="signup-email" className="text-xs">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      form="signup-form"
                      type="email"
                      value={signUpForm.email}
                      onChange={(event) => setSignUpForm((c) => ({ ...c, email: event.target.value }))}
                      autoComplete="email"
                      className="h-9 rounded-lg text-sm"
                      placeholder="warung@email.com"
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="signup-password" className="text-xs">Kata sandi</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      form="signup-form"
                      type="password"
                      value={signUpForm.password}
                      onChange={(event) => setSignUpForm((c) => ({ ...c, password: event.target.value }))}
                      autoComplete="new-password"
                      className="h-9 rounded-lg text-sm"
                      placeholder="Minimal 8 karakter"
                      minLength={8}
                      required
                    />
                  </div>
                  <Button type="submit" form="signup-form" className="h-9 w-full rounded-lg text-sm">
                    Buat akun
                  </Button>
                </div>
                <form id="signup-form" action="/api/session/sign-up" method="post">
                  <input type="hidden" name="callbackURL" value="/dashboard" />
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
