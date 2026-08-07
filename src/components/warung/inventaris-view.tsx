"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, PackagePlus, PencilLine, Plus, Search, Settings2, Trash2, Warehouse, X } from "lucide-react";
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
import { fuzzyFindSimilar } from "@/lib/fuzzy";

const defaultCategories = ["Sembako"];

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
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [sortOrder, setSortOrder] = useState<"az" | "za">("az");
  const [categoryManageOpen, setCategoryManageOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [deleteDefaultConfirm, setDeleteDefaultConfirm] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState<{ category: string; count: number } | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  const [duplicateTarget, setDuplicateTarget] = useState<{ name: string; isExact: boolean; existing?: { id: string; name: string } } | null>(null);

  const categories = Array.from(
    new Set([...defaultCategories, ...localCategories, ...products.map((p) => p.category)])
  );

  function addCategory(name: string) {
    setLocalCategories((prev) =>
      prev.some((c) => c.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]
    );
  }

  function removeCategory(name: string) {
    const productsInCategory = products.filter((p) => p.category === name);
    if (productsInCategory.length > 0) {
      const otherCategories = categories.filter((c) => c !== name);
      setReassignTo(otherCategories[0] ?? "");
      setReassignTarget({ category: name, count: productsInCategory.length });
      return;
    }
    // Empty category - still show confirmation
    if (defaultCategories.includes(name)) {
      setDeleteDefaultConfirm(name);
    } else {
      setDeleteDefaultConfirm(name);
    }
  }

  async function handleReassign() {
    if (!reassignTarget || !reassignTo) return;
    setCategoryLoading(true);
    try {
      const productsToMove = products.filter((p) => p.category === reassignTarget.category);
      for (const p of productsToMove) {
        await updateProduct(p.id, { name: p.name, buyPrice: p.buyPrice, sellPrice: p.sellPrice, stock: p.stock, minimumStock: p.minimumStock, description: p.description, category: reassignTo });
      }
      if (!defaultCategories.includes(reassignTarget.category)) {
        setLocalCategories((prev) => prev.filter((c) => c !== reassignTarget.category));
      }
      setReassignTarget(null);
      toast.success(`${productsToMove.length} produk dipindah ke ${reassignTo}.`);
    } finally {
      setCategoryLoading(false);
    }
  }

  const filteredProducts = products
    .filter((product) => {
      const keyword = query.toLowerCase();
      const matchQuery =
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword);
      const matchCategory = categoryFilter === "Semua" || product.category === categoryFilter;
      return matchQuery && matchCategory;
    })
    .sort((a, b) => sortOrder === "az" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.buyPrice * product.stock,
    0
  );

  function validateProduct(d: ProductDraft) {
    return d.name.trim().length > 0 && d.sellPrice > 0 && d.buyPrice >= 0 && d.stock >= 0 && d.minimumStock >= 0;
  }

  async function handleCreateProduct(forceDuplicate = false) {
    if (saving) return;
    if (!validateProduct(draft)) { toast.error("Lengkapi data produk lebih dulu."); return; }

    // Duplicate detection (hanya saat tambah baru)
    if (!forceDuplicate) {
      const searchName = draft.name.toLowerCase().trim();
      const existing = products.find(
        (p) => p.name.toLowerCase().trim() === searchName
      );
      if (existing) {
        setDuplicateTarget({ name: draft.name, isExact: true, existing: { id: existing.id, name: existing.name } });
        return;
      }
      const existingNames = products.map((p) => p.name);
      const similar = fuzzyFindSimilar(draft.name, existingNames, 0.7);
      if (similar) {
        const similarProduct = products.find(
          (p) => p.name.toLowerCase().trim() === similar.toLowerCase().trim()
        );
        if (similarProduct) {
          setDuplicateTarget({ name: draft.name, isExact: false, existing: { id: similarProduct.id, name: similarProduct.name } });
          return;
        }
      }
    }

    try {
      setSaving(true);
      setDuplicateTarget(null);
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
      <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        <StatCard title="Total SKU" value={`${products.length} produk`} description="Produk aktif di warung." />
        <StatCard title="Stok menipis" value={`${lowStockProducts.length} item`} description="Perlu restok sebelum kehabisan." tone="warn" />
        <div className="col-span-2 sm:col-span-1">
          <StatCard title="Nilai stok" value={formatCurrency(totalInventoryValue)} description="Total modal di inventaris." tone="accent" />
        </div>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="font-heading text-lg">Inventaris barang</CardTitle>
            <CardDescription>Kelola produk, stok, dan harga jual.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk..." className="h-9 w-full rounded-lg border-border bg-muted/50 pl-8 text-sm" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 shrink-0 rounded-lg border border-border bg-card px-2 text-xs"
              >
                <option value="Semua">Semua kategori</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 rounded-lg px-2 text-xs"
                onClick={() => setSortOrder(sortOrder === "az" ? "za" : "az")}
              >
                {sortOrder === "az" ? "A→Z" : "Z→A"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 rounded-lg px-2 text-xs"
                onClick={() => setCategoryManageOpen(true)}
              >
                <Settings2 className="size-3.5" />
              </Button>
            </div>
            <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setSaving(false); }}>
              <DialogTrigger render={<Button size="sm" className="h-9 shrink-0 rounded-lg whitespace-nowrap" />}>
                <PackagePlus className="size-3.5 sm:size-4" />
                Tambah barang
              </DialogTrigger>
              <DialogContent className="max-w-md" showCloseButton>
                <DialogHeader>
                  <DialogTitle>Tambah produk baru</DialogTitle>
                  <DialogDescription>Isi data supaya kasir bisa langsung menjual barang ini.</DialogDescription>
                </DialogHeader>
                <ProductForm draft={draft} onDraftChange={setDraft} categories={categories} onAddCategory={addCategory} />
                <DialogFooter>
                  <Button type="button" size="sm" className="rounded-lg px-4" disabled={saving} onClick={() => void handleCreateProduct()}>{saving ? (<><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menyimpan...</>) : "Simpan"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Produk</TableHead>
                <TableHead className="text-xs sm:text-sm">Kategori</TableHead>
                <TableHead className="text-xs sm:text-sm">Beli</TableHead>
                <TableHead className="text-xs sm:text-sm">Jual</TableHead>
                <TableHead className="text-xs sm:text-sm">Stok</TableHead>
                <TableHead className="text-xs sm:text-sm">Min</TableHead>
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
            <Button type="button" size="sm" className="rounded-lg px-4" disabled={saving} onClick={() => void handleUpdateProduct()}>{saving ? (<><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menyimpan...</>) : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Category management dialog ── */}
      <Dialog open={categoryManageOpen} onOpenChange={setCategoryManageOpen}>
        <DialogContent className="max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Kelola Kategori</DialogTitle>
            <DialogDescription>Tambah atau hapus kategori produk.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama kategori baru"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCategoryName.trim()) {
                    addCategory(newCategoryName.trim());
                    setNewCategoryName("");
                  }
                }}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              />
              <Button
                type="button"
                size="sm"
                className="h-10 rounded-xl px-3"
                disabled={!newCategoryName.trim()}
                onClick={() => { addCategory(newCategoryName.trim()); setNewCategoryName(""); }}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-sm">{cat}</span>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className={cn(
                      "transition-colors hover:text-destructive",
                      defaultCategories.includes(cat) ? "text-muted-foreground/50" : "text-muted-foreground"
                    )}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Reassign products dialog ── */}
      {reassignTarget && (
        <Dialog open onOpenChange={() => setReassignTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg">Pindahkan produk?</DialogTitle>
              <DialogDescription>
                Ada <strong>{reassignTarget.count} produk</strong> pakai kategori <strong>{reassignTarget.category}</strong>. Pindahkan ke kategori lain sebelum menghapus.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <select
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              >
                {categories.filter((c) => c !== reassignTarget.category).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button type="button" className="rounded-xl flex-1 py-2.5 text-sm" disabled={categoryLoading} onClick={() => { setReassignTarget(null); setCategoryLoading(false); }}>
                  Batal
                </Button>
                <Button type="button" variant="destructive" className="rounded-xl flex-1 py-2.5 text-sm" disabled={!reassignTo || categoryLoading} onClick={() => void handleReassign()}>
                  {categoryLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memindahkan...
                    </span>
                  ) : "Pindahkan & Hapus"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Delete category confirmation ── */}
      {deleteDefaultConfirm && (
        <Dialog open onOpenChange={() => { setDeleteDefaultConfirm(null); setCategoryLoading(false); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg">
                {defaultCategories.includes(deleteDefaultConfirm) ? "Hapus kategori default?" : "Hapus kategori?"}
              </DialogTitle>
              <DialogDescription>
                {defaultCategories.includes(deleteDefaultConfirm) ? (
                  <><strong>{deleteDefaultConfirm}</strong> adalah kategori default. Yakin ingin menghapusnya?</>
                ) : (
                  <>Yakin ingin menghapus kategori <strong>{deleteDefaultConfirm}</strong>?</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-2">
              <Button type="button" size="sm" className="rounded-lg" disabled={categoryLoading} onClick={() => { setDeleteDefaultConfirm(null); setCategoryLoading(false); }}>
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="rounded-lg"
                disabled={categoryLoading}
                onClick={async () => {
                  setCategoryLoading(true);
                  setLocalCategories((prev) => prev.filter((c) => c !== deleteDefaultConfirm));
                  await new Promise((r) => setTimeout(r, 300));
                  setDeleteDefaultConfirm(null);
                  setCategoryLoading(false);
                  toast.success("Kategori berhasil dihapus.");
                }}
              >
                {categoryLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menghapus...
                  </span>
                ) : "Hapus"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Duplicate confirmation ── */}
      {duplicateTarget && (
        <Dialog open onOpenChange={() => setDuplicateTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg">
                {duplicateTarget.isExact ? "Produk sudah ada" : "Mirip dengan produk lain"}
              </DialogTitle>
              <DialogDescription>
                {duplicateTarget.isExact ? (
                  <>Nama <strong>{duplicateTarget.name}</strong> sudah terdaftar.</>
                ) : (
                  <>Nama <strong>{duplicateTarget.name}</strong> mirip dengan <strong>{duplicateTarget.existing?.name}</strong>.</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 pt-2">
              <Button type="button" size="sm" className="rounded-lg" onClick={() => setDuplicateTarget(null)}>
                Batal
              </Button>
              <Button type="button" size="sm" variant="outline" className="rounded-lg" disabled={saving} onClick={() => void handleCreateProduct(true)}>
                {saving ? <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menyimpan...</> : "Tetap tambahkan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
            <Button type="button" size="sm" className="rounded-lg px-4" disabled={saving} onClick={() => void handleRestock()}>{saving ? (<><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menyimpan...</>) : "Simpan"}</Button>
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
            <Button type="button" variant="destructive" size="sm" className="rounded-lg px-4" disabled={saving} onClick={() => void handleDeleteProduct()}>{saving ? (<><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menghapus...</>) : "Hapus"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
