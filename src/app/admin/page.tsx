"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Package,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Shield,
  TrendingUp,
  Loader2,
  ArrowLeft,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

type SystemStats = {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  totalProducts: number;
  totalTransactions: number;
  activeDebts: number;
  totalRevenue: number;
};

type UserWithStats = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  approved: boolean;
  isAdmin: boolean;
  stats: {
    products: number;
    transactions: number;
    debts: number;
    expenses: number;
  };
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteLoading, setPromoteLoading] = useState(false);

  const [debugInfo, setDebugInfo] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        const statsBody = await statsRes.json().catch(() => ({}));
        const usersBody = await usersRes.json().catch(() => ({}));
        setDebugInfo(JSON.stringify({ stats: statsRes.status, statsBody, users: usersRes.status, usersBody }));
        return;
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      setStats(statsData.stats);
      setUsers(usersData.users);
    } catch (err) {
      setDebugInfo("Error: " + String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleApprove(targetUserId: string) {
    setActionLoading(targetUserId);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, approved: true }),
      });
      if (!res.ok) throw new Error("Gagal menyetujui user.");
      toast.success("User disetujui!");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnapprove(targetUserId: string) {
    setActionLoading(targetUserId);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, approved: false }),
      });
      if (!res.ok) throw new Error("Gagal membatalkan persetujuan.");
      toast.success("Persetujuan dibatalkan.");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(targetUserId: string, name: string) {
    if (!confirm(`Yakin hapus user "${name}"? Semua data akan dihapus permanen.`)) return;
    setActionLoading(targetUserId);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menghapus user.");
      }
      toast.success("User dihapus.");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handlePromote() {
    if (!promoteEmail.trim()) return;
    setPromoteLoading(true);
    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: promoteEmail.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal.");
      }
      toast.success(`${promoteEmail} jadi admin!`);
      setPromoteEmail("");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal.");
    } finally {
      setPromoteLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const pendingUsers = filteredUsers.filter((u) => !u.approved);
  const approvedUsers = filteredUsers.filter((u) => u.approved && !u.isAdmin);
  const adminUsers = filteredUsers.filter((u) => u.isAdmin);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (debugInfo) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-4 p-6">
            <h1 className="font-heading text-lg font-semibold">Debug Info</h1>
            <p className="text-sm text-muted-foreground">Admin API mengembalikan error. Ini info debug-nya:</p>
            <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">{debugInfo}</pre>
            <Button type="button" size="sm" className="rounded-lg" onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-5xl space-y-4 p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-lg"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="font-heading text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Monitor dan kelola pengguna WarungKu OS</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Shield className="size-3" />
            Admin
          </Badge>
        </div>

        {/* Stats Cards */}
        {stats && (
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                <p className="text-xs">Total User</p>
              </div>
              <p className="mt-1.5 font-heading text-2xl font-semibold">{stats.totalUsers}</p>
              <p className="text-[10px] text-muted-foreground">{stats.pendingUsers} menunggu</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="size-4" />
                <p className="text-xs">Total Produk</p>
              </div>
              <p className="mt-1.5 font-heading text-2xl font-semibold">{stats.totalProducts}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Receipt className="size-4" />
                <p className="text-xs">Total Transaksi</p>
              </div>
              <p className="mt-1.5 font-heading text-2xl font-semibold">{stats.totalTransactions}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="size-4" />
                <p className="text-xs">Total Omzet</p>
              </div>
              <p className="mt-1.5 font-heading text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
            </Card>
          </section>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari user..."
            className="h-9 rounded-lg border-border bg-muted/50 pl-9 text-sm"
          />
        </div>

        {/* Pending Users */}
        {pendingUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <AlertTriangle className="size-4 text-amber-500" />
                Menunggu Persetujuan ({pendingUsers.length})
              </CardTitle>
              <CardDescription className="text-xs">
                User yang sudah mendaftar tapi belum disetujui.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-950/30"
                >
                  <div>
                    <p className="text-sm font-medium">{user.name || "Tanpa nama"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Daftar: {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      disabled={actionLoading === user.id}
                      onClick={() => void handleApprove(user.id)}
                    >
                      {actionLoading === user.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <><CheckCircle2 className="mr-1 size-3.5" />Setujui</>
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-8 rounded-lg"
                      disabled={actionLoading === user.id}
                      onClick={() => void handleDelete(user.id, user.name)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Approved Users */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Pengguna Aktif ({approvedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvedUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground">Belum ada pengguna aktif.</p>
            ) : (
              <div className="space-y-2">
                {approvedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{user.name || "Tanpa nama"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                        <span>{user.stats.products} produk</span>
                        <span>{user.stats.transactions} transaksi</span>
                        <span>{user.stats.debts} hutang aktif</span>
                        <span>{user.stats.expenses} pengeluaran</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg text-xs"
                        disabled={actionLoading === user.id}
                        onClick={() => void handleUnapprove(user.id)}
                      >
                        <XCircle className="mr-1 size-3" />
                        Blokir
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-8 rounded-lg"
                        disabled={actionLoading === user.id}
                        onClick={() => void handleDelete(user.id, user.name)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Users */}
        {adminUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <Shield className="size-4 text-primary" />
                Admin ({adminUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {adminUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-lg border border-primary/20 bg-primary/5 p-3"
                  >
                    <p className="text-sm font-medium">{user.name || "Tanpa nama"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Promote to Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Promosi Admin</CardTitle>
            <CardDescription className="text-xs">
              Jadikan user lain sebagai admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={promoteEmail}
                onChange={(e) => setPromoteEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="h-9 flex-1 rounded-lg text-sm"
                type="email"
              />
              <Button
                type="button"
                size="sm"
                className="rounded-lg"
                disabled={promoteLoading || !promoteEmail.trim()}
                onClick={() => void handlePromote()}
              >
                {promoteLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Shield className="mr-1 size-3.5" />}
                Promote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
