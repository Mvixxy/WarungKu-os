"use client";

import { useState } from "react";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";

export function UserAccountCard() {
  const { data: session } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [isSavingName, setIsSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const hasNameChanged = name.trim() !== (user?.name ?? "");

  async function handleUpdateName() {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong.");
      return;
    }
    setIsSavingName(true);
    try {
      const res = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Gagal update nama.");
      }
      toast.success("Nama berhasil diperbarui.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal update nama.");
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword) {
      toast.error("Password lama wajib diisi.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Gagal ganti password.");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password berhasil diganti.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal ganti password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Akun pengguna</CardTitle>
        <CardDescription className="text-xs">
          Kelola email dan password akun login kamu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Email (read-only) */}
        <div className="rounded-xl border border-border p-3.5">
          <div className="flex items-center gap-1.5">
            <Mail className="size-3.5 text-primary" />
            <p className="text-xs font-medium">Email</p>
          </div>
          <div className="mt-2.5">
            <Input
              value={user?.email ?? ""}
              disabled
              className="h-8 rounded-lg text-sm bg-muted/50"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">Email tidak bisa diubah.</p>
          </div>
        </div>

        {/* Name */}
        <div className="rounded-xl border border-border p-3.5">
          <div className="flex items-center gap-1.5">
            <User className="size-3.5 text-primary" />
            <p className="text-xs font-medium">Nama tampilan</p>
          </div>
          <div className="mt-2.5 flex items-end gap-2">
            <div className="flex-1 grid gap-1">
              <Label htmlFor="user-name" className="text-[10px]">Nama</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 rounded-lg text-sm"
                placeholder="Nama kamu"
              />
            </div>
            <Button
              size="sm"
              className="h-8 rounded-lg shrink-0"
              onClick={() => void handleUpdateName()}
              disabled={!hasNameChanged || isSavingName}
            >
              {isSavingName ? <Loader2 className="size-3.5 animate-spin" /> : "Simpan"}
            </Button>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-xl border border-border p-3.5">
          <div className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-primary" />
            <p className="text-xs font-medium">Ganti password</p>
          </div>
          <div className="mt-2.5 space-y-2">
            <div className="grid gap-1">
              <Label htmlFor="current-pw" className="text-[10px]">Password lama</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-8 rounded-lg text-sm pr-8"
                  placeholder="Masukkan password lama"
                />
              </div>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="new-pw" className="text-[10px]">Password baru</Label>
              <Input
                id="new-pw"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-8 rounded-lg text-sm"
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="confirm-pw" className="text-[10px]">Konfirmasi password baru</Label>
              <Input
                id="confirm-pw"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-8 rounded-lg text-sm"
                placeholder="Ulangi password baru"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-lg text-xs"
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="size-3 mr-1" /> : <Eye className="size-3 mr-1" />}
                {showPasswords ? "Sembunyikan" : "Tampilkan"}
              </Button>
              <span className="text-[10px] text-muted-foreground">
                {newPassword.length > 0 && `${newPassword.length}/8 karakter`}
              </span>
            </div>
            <Button
              size="sm"
              className="rounded-lg"
              onClick={() => void handleChangePassword()}
              disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
            >
              {isChangingPassword ? (
                <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Mengganti...</>
              ) : (
                <><Lock className="mr-1.5 size-3.5" />Ganti password</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
