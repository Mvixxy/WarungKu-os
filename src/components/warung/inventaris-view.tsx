"use client";

import { useState } from "react";
import { AlertTriangle, PackagePlus, PencilLine, Search, Warehouse } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { Product, ProductCategory, ProductDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

const emptyDraft: ProductDraft = {
  name: "",
  category: "Makanan",
  buyPrice: 0,
  sellPrice: 0,
  stock: 0,
  minimumStock: 0,
  description: "",
};

function ProductForm({
  draft,
  onChange,
}: {
  draft: ProductDraft;
  onChange: (draft: ProductDraft) => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="product-name" className="text-xs">Nama barang</Label>
        <Input
          id="product-name"
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          placeholder="Contoh: Mi Instan Goreng"
          className="h-9 rounded-lg text-sm"
        />
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-xs">Kategori</Label>
          <Select
            value={draft.category}
            onValueChange={(value) => onChange({ ...draft, category: value as ProductCategory })}
          >
            <SelectTrigger className="h-9 w-full rounded-lg bg-card text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Makanan">Makanan</SelectItem>
              <SelectItem value="Minuman">Minuman</SelectItem>
              <SelectItem value="Sembako">Sembako</SelectItem>
              <SelectItem value="Kebutuhan Harian">Kebutuhan Harian</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="product-stock" className="text-xs">Stok awal</Label>
          <Input
            id="product-stock"
            type="number"
            min={0}
            value={draft.stock}
            onChange={(event) => onChange({ ...draft, stock: Number(event.target.value) })}
            className="h-9 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="product-buy-price" className="text-xs">Harga beli</Label>
          <Input
            id="product-buy-price"
            type="number"
            min={0}
            value={draft.buyPrice}
            onChange={(event) => onChange({ ...draft, buyPrice: Number(event.target.value) })}
            className="h-9 rounded-lg text-sm"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="product-sell-price" className="text-xs">Harga jual</Label>
          <Input
            id="product-sell-price"
            type="number"
            min={0}
            value={draft.sellPrice}
            onChange={(event) => onChange({ ...draft, sellPrice: Number(event.target.value) })}
            className="h-9 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="product-minimum-stock" className="text-xs">Stok minimum</Label>
        <Input
          id="product-minimum-stock"
          type="number"
          min={0}
          value={draft.minimumStock}
          onChange={(event) => onChange({ ...draft, minimumStock: Number(event.target.value) })}
          className="h-9 rounded-lg text-sm"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="product-description" className="text-xs">Catatan singkat</Label>
        <Input
          id="product-description"
          value={draft.description}
          onChange={(event) => onChange({ ...draft, description: event.target.value })}
          placeholder="Penempatan rak, paket laris, atau info kasir"
          className="h-9 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}

export function InventarisView() {
  const { products, addProduct, updateProduct, restockProduct, lowStockProducts } = useAppState();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDraft, setEditDraft] = useState<ProductDraft>(emptyDraft);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState(12);

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

  function validateProduct(nextDraft: ProductDraft) {
    return (
      nextDraft.name.trim().length > 0 &&
      nextDraft.sellPrice > 0 &&
      nextDraft.buyPrice >= 0 &&
      nextDraft.stock >= 0 &&
      nextDraft.minimumStock >= 0
    );
  }

  async function handleCreateProduct() {
    try {
      if (!validateProduct(draft)) {
        toast.error("Lengkapi data produk lebih dulu.");
        return;
      }
      await addProduct(draft);
      setDraft(emptyDraft);
      setCreateOpen(false);
      toast.success("Produk baru berhasil ditambahkan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambah produk.");
    }
  }

  async function handleUpdateProduct() {
    try {
      if (!editingProduct || !validateProduct(editDraft)) {
        toast.error("Periksa kembali data yang ingin diperbarui.");
        return;
      }
      await updateProduct(editingProduct.id, editDraft);
      setEditingProduct(null);
      toast.success(`${editDraft.name} berhasil diperbarui.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui produk.");
    }
  }

  async function handleRestock() {
    try {
      if (!restockTarget || restockAmount <= 0) {
        toast.error("Masukkan jumlah restok yang valid.");
        return;
      }
      await restockProduct(restockTarget.id, restockAmount);
      toast.success(`${restockTarget.name} ditambah ${restockAmount} stok.`);
      setRestockTarget(null);
      setRestockAmount(12);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambah stok.");
    }
  }

  return (
    <div className="space-y-3">
      <section className="grid gap-3 md:grid-cols-3">
        <StatCard
          title="Total SKU"
          value={`${products.length} produk`}
          description="Produk aktif di warung."
        />
        <StatCard
          title="Stok menipis"
          value={`${lowStockProducts.length} item`}
          description="Perlu restok sebelum kehabisan."
          tone="warn"
        />
        <StatCard
          title="Nilai stok"
          value={formatCurrency(totalInventoryValue)}
          description="Total modal di inventaris."
          tone="accent"
        />
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="font-heading text-lg">Inventaris barang</CardTitle>
            <CardDescription>
              Kelola produk, stok, dan harga jual.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative min-w-[220px]">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari produk..."
                className="h-9 rounded-lg border-border bg-muted/50 pl-8 text-sm"
              />
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger
                render={<Button size="sm" className="h-9 rounded-lg" />}
              >
                <PackagePlus className="size-3.5" />
                Tambah barang
              </DialogTrigger>
              <DialogContent className="max-w-lg rounded-xl p-0">
                <DialogHeader className="p-4 pb-0">
                  <DialogTitle className="font-heading text-lg">Tambah produk baru</DialogTitle>
                  <DialogDescription className="text-xs">
                    Isi data supaya kasir bisa langsung menjual barang ini.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 pt-2">
                  <ProductForm draft={draft} onChange={setDraft} />
                </div>
                <DialogFooter className="rounded-b-xl px-4 pb-4" showCloseButton>
                  <Button type="button" size="sm" className="rounded-lg" onClick={() => void handleCreateProduct()}>
                    Simpan
                  </Button>
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
                        {product.description && (
                          <p className="text-xs text-muted-foreground">{product.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{product.category}</TableCell>
                    <TableCell className="text-xs">{formatCurrency(product.buyPrice)}</TableCell>
                    <TableCell className="text-xs font-medium">{formatCurrency(product.sellPrice)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={lowStock ? "destructive" : "secondary"}
                          className="rounded-full text-[10px] px-2 py-0.5"
                        >
                          {product.stock}
                        </Badge>
                        {lowStock && <AlertTriangle className="size-3 text-destructive" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{product.minimumStock}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 rounded-md text-xs"
                          onClick={() => {
                            setEditingProduct(product);
                            setEditDraft({
                              name: product.name,
                              category: product.category,
                              buyPrice: product.buyPrice,
                              sellPrice: product.sellPrice,
                              stock: product.stock,
                              minimumStock: product.minimumStock,
                              description: product.description,
                            });
                          }}
                        >
                          <PencilLine className="size-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 rounded-md text-xs"
                          onClick={() => setRestockTarget(product)}
                        >
                          <Warehouse className="size-3" />
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

      <Dialog open={Boolean(editingProduct)} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-lg rounded-xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="font-heading text-lg">Edit produk</DialogTitle>
            <DialogDescription className="text-xs">Perbarui data produk.</DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-2">
            <ProductForm draft={editDraft} onChange={setEditDraft} />
          </div>
          <DialogFooter className="rounded-b-xl px-4 pb-4" showCloseButton>
            <Button type="button" size="sm" className="rounded-lg" onClick={() => void handleUpdateProduct()}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(restockTarget)} onOpenChange={(open) => !open && setRestockTarget(null)}>
        <DialogContent className="max-w-sm rounded-xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="font-heading text-lg">Restok</DialogTitle>
            <DialogDescription className="text-xs">
              Tambah stok untuk {restockTarget?.name ?? "produk"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-4 pt-2">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Stok sekarang</p>
              <p className="mt-1 font-heading text-xl font-semibold">
                {restockTarget?.stock ?? 0} pcs
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="restock-amount" className="text-xs">Jumlah tambahan</Label>
              <Input
                id="restock-amount"
                type="number"
                min={1}
                value={restockAmount}
                onChange={(event) => setRestockAmount(Number(event.target.value))}
                className="h-9 rounded-lg text-sm"
              />
            </div>
          </div>
          <DialogFooter className="rounded-b-xl px-4 pb-4" showCloseButton>
            <Button type="button" size="sm" className="rounded-lg" onClick={() => void handleRestock()}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
