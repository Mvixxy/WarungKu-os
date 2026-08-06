"use client";

import { useState } from "react";
import { AlertTriangle, PackagePlus, PencilLine, Plus, Search, Trash2, Warehouse, X } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { Product, ProductCategory, ProductDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

const defaultCategories = ["Makanan", "Minuman", "Sembako", "Kebutuhan Harian"];

const emptyDraft: ProductDraft = {
  name: "",
  category: "Makanan",
  buyPrice: 0,
  sellPrice: 0,
  stock: 0,
  minimumStock: 0,
  description: "",
};

function NumberInput({
  id,
  value,
  onChange,
  min = 0,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value || ""}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        onChange(raw === "" ? 0 : Number(raw));
      }}
      className="h-9 rounded-lg text-sm"
    />
  );
}

function CategorySelect({
  value,
  onChange,
  categories,
  onAddCategory,
}: {
  value: string;
  onChange: (v: ProductCategory) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  function submit() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Kategori sudah ada.");
      return;
    }
    onAddCategory(trimmed);
    onChange(trimmed as ProductCategory);
    setNewName("");
    setAdding(false);
  }

  if (adding) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama kategori..."
          autoFocus
          className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); submit(); }
            if (e.key === "Escape") { setAdding(false); setNewName(""); }
          }}
        />
        <Button type="button" variant="ghost" size="icon-sm" className="shrink-0 rounded-lg" onClick={submit}>
          <Plus className="size-3.5" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" className="shrink-0 rounded-lg" onClick={() => { setAdding(false); setNewName(""); }}>
          <X className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ProductCategory)}
        className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <Button type="button" variant="outline" size="icon-sm" className="shrink-0 rounded-lg" title="Tambah kategori baru" onClick={() => setAdding(true)}>
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}

function ProductForm({
  draft,
  onDraftChange,
  categories,
  onAddCategory,
}: {
  draft: ProductDraft;
  onDraftChange: (d: ProductDraft) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="product-name" className="text-xs font-medium">Nama barang</Label>
        <Input
          id="product-name"
          value={draft.name}
          onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
          placeholder="Contoh: Mi Instan Goreng"
          className="h-9 rounded-lg text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Kategori</Label>
          <CategorySelect
            value={draft.category}
            onChange={(category) => onDraftChange({ ...draft, category })}
            categories={categories}
            onAddCategory={onAddCategory}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-stock" className="text-xs font-medium">Stok awal</Label>
          <NumberInput id="product-stock" value={draft.stock} onChange={(v) => onDraftChange({ ...draft, stock: v })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="product-buy-price" className="text-xs font-medium">Harga beli</Label>
          <NumberInput id="product-buy-price" value={draft.buyPrice} onChange={(v) => onDraftChange({ ...draft, buyPrice: v })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-sell-price" className="text-xs font-medium">Harga jual</Label>
          <NumberInput id="product-sell-price" value={draft.sellPrice} onChange={(v) => onDraftChange({ ...draft, sellPrice: v })} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-minimum-stock" className="text-xs font-medium">Stok minimum</Label>
        <NumberInput id="product-minimum-stock" value={draft.minimumStock} onChange={(v) => onDraftChange({ ...draft, minimumStock: v })} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="product-description" className="text-xs font-medium">Catatan singkat</Label>
        <Input
          id="product-description"
          value={draft.description}
          onChange={(e) => onDraftChange({ ...draft, description: e.target.value })}
          placeholder="Penempatan rak, paket laris, atau info kasir"
          className="h-9 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}

export function InventarisView() {
  const { products, addProduct, updateProduct, restockProduct, deleteProduct, lowStockProducts } = useAppState();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDraft, setEditDraft] = useState<ProductDraft>(emptyDraft);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState(12);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [localCategories, setLocalCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const categories = Array.from(
    new Set([...defaultCategories, ...localCategories, ...products.map((p) => p.category)])
  );

  function addCategory(name: string) {
    setLocalCategories((prev) =>
      prev.some((c) => c.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]
    );
  }

  const filteredProducts = products.filter((product) => {
    const keyword = query.toLowerCase();
    return (
      product.name.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword)
    );
  });

  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.buyPrice * product.stock,
    0
  );

  function validateProduct(d: ProductDraft) {
    return d.name.trim().length > 0 && d.sellPrice > 0 && d.buyPrice >= 0 && d.stock >= 0 && d.minimumStock >= 0;
  }

  async function handleCreateProduct() {
    if (saving) return;
    try {
      if (!validateProduct(draft)) { toast.error("Lengkapi data produk lebih dulu."); return; }
      setSaving(true);
      await addProduct(draft);
      setDraft(emptyDraft);
      setCreateOpen(false);
      toast.success("Produk baru berhasil ditambahkan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambah produk.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateProduct() {
    if (saving) return;
    try {
      if (!editingProduct || !validateProduct(editDraft)) { toast.error("Periksa kembali data yang ingin diperbarui."); return; }
      setSaving(true);
      await updateProduct(editingProduct.id, editDraft);
      setEditingProduct(null);
      toast.success(`${editDraft.name} berhasil diperbarui.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui produk.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRestock() {
    if (saving) return;
    try {
      if (!restockTarget || restockAmount <= 0) { toast.error("Masukkan jumlah restok yang valid."); return; }
      setSaving(true);
      await restockProduct(restockTarget.id, restockAmount);
      toast.success(`${restockTarget.name} ditambah ${restockAmount} stok.`);
      setRestockTarget(null);
      setRestockAmount(12);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambah stok.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct() {
    if (saving || !deleteTarget) return;
    try {
      setSaving(true);
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      toast.success(deleteTarget.name + " berhasil dihapus.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus produk.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <section className="grid gap-3 md:grid-cols-3">
        <StatCard title="Total SKU" value={`${products.length} produk`} description="Produk aktif di warung." />
        <StatCard title="Stok menipis" value={`${lowStockProducts.length} item`} description="Perlu restok sebelum kehabisan." tone="warn" />
        <StatCard title="Nilai stok" value={formatCurrency(totalInventoryValue)} description="Total modal di inventaris." tone="accent" />
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="font-heading text-lg">Inventaris barang</CardTitle>
            <CardDescription>Kelola produk, stok, dan harga jual.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative min-w-[220px]">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk..." className="h-9 rounded-lg border-border bg-muted/50 pl-8 text-sm" />
            </div>
            <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setSaving(false); }}>
              <DialogTrigger render={<Button size="sm" className="h-9 rounded-lg" />}>
                <PackagePlus className="size-3.5" />
                Tambah barang
              </DialogTrigger>
              <DialogContent className="max-w-md" showCloseButton>
                <DialogHeader>
                  <DialogTitle>Tambah produk baru</DialogTitle>
                  <DialogDescription>Isi data supaya kasir bisa langsung menjual barang ini.</DialogDescription>
                </DialogHeader>
                <ProductForm draft={draft} onDraftChange={setDraft} categories={categories} onAddCategory={addCategory} />
                <DialogFooter>
                  <Button type="button" size="sm" className="rounded-lg px-4" disabled={saving} onClick={() => void handleCreateProduct()}>{saving ? "Menyimpan..." : "Simpan"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Produk</TableHead>
                <TableHead className="text-xs">Kategori</TableHead>
                <TableHead className="text-xs">Beli</TableHead>
                <TableHead className="text-xs">Jual</TableHead>
                <TableHead className="text-xs">Stok</TableHead>
                <TableHead className="text-xs">Min</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const lowStock = product.stock <= product.minimumStock;
                return (
                  <TableRow key={product.id} className={cn(lowStock && "bg-primary/5")}>
                    <TableCell className="min-w-[200px]">
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        {product.description && <p className="text-xs text-muted-foreground">{product.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{product.category}</TableCell>
                    <TableCell className="text-xs">{formatCurrency(product.buyPrice)}</TableCell>
                    <TableCell className="text-xs font-medium">{formatCurrency(product.sellPrice)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={lowStock ? "destructive" : "secondary"} className="rounded-full text-[10px] px-2 py-0.5">{product.stock}</Badge>
                        {lowStock && <AlertTriangle className="size-3 text-destructive" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{product.minimumStock}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="sm" className="h-7 rounded-md text-xs" onClick={() => {
                          setEditingProduct(product);
                          setEditDraft({ name: product.name, category: product.category, buyPrice: product.buyPrice, sellPrice: product.sellPrice, stock: product.stock, minimumStock: product.minimumStock, description: product.description });
                        }}>
                          <PencilLine className="size-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-7 rounded-md text-xs" onClick={() => setRestockTarget(product)}>
                          <Warehouse className="size-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-7 rounded-md text-xs text-destructive hover:text-destructive" onClick={() => setDeleteTarget(product)}>
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingProduct)} onOpenChange={(o) => { if (!o) { setEditingProduct(null); setSaving(false); } }}>
        <DialogContent className="max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Edit produk</DialogTitle>
            <DialogDescription>Perbarui data produk.</DialogDescription>
          </DialogHeader>
          <ProductForm draft={editDraft} onDraftChange={setEditDraft} categories={categories} onAddCategory={addCategory} />
          <DialogFooter>
            <Button type="button" size="sm" className="rounded-lg px-4" disabled={saving} onClick={() => void handleUpdateProduct()}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(restockTarget)} onOpenChange={(o) => { if (!o) { setRestockTarget(null); setSaving(false); } }}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>Restok</DialogTitle>
            <DialogDescription>Tambah stok untuk {restockTarget?.name ?? "produk"}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Stok sekarang</p>
              <p className="mt-1 font-heading text-xl font-semibold">{restockTarget?.stock ?? 0} pcs</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="restock-amount" className="text-xs font-medium">Jumlah tambahan</Label>
              <NumberInput id="restock-amount" value={restockAmount} onChange={setRestockAmount} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" size="sm" className="rounded-lg px-4" disabled={saving} onClick={() => void handleRestock()}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => { if (!o) { setDeleteTarget(null); setSaving(false); } }}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>Hapus produk</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus <span className="font-medium text-foreground">{deleteTarget?.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button type="button" variant="destructive" size="sm" className="rounded-lg px-4" disabled={saving} onClick={() => void handleDeleteProduct()}>{saving ? "Menghapus..." : "Hapus"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
