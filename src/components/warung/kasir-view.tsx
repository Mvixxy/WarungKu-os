"use client";

import { useState } from "react";
import { BanknoteArrowDown, Coffee, CreditCard, Minus, PackageSearch, Plus, ReceiptText, Search, ShoppingBasket, Sparkles, Wheat, X } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/components/providers/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/format";
import { PaymentMethod, Product, ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const paymentLabels: Record<PaymentMethod, string> = {
  Tunai: "Tunai",
  QRIS: "QRIS",
  Transfer: "Transfer",
};

const categoryLabels: Array<{ value: "Semua" | ProductCategory; label: string }> = [
  { value: "Semua", label: "Semua" },
  { value: "Makanan", label: "Makanan" },
  { value: "Minuman", label: "Minuman" },
  { value: "Sembako", label: "Sembako" },
  { value: "Kebutuhan Harian", label: "Harian" },
];

function ProductCategoryIcon({ category }: { category: ProductCategory }) {
  if (category === "Minuman") {
    return <Coffee className="size-3.5 sm:size-4" />;
  }
  if (category === "Sembako") {
    return <Wheat className="size-3.5 sm:size-4" />;
  }
  if (category === "Kebutuhan Harian") {
    return <Sparkles className="size-3.5 sm:size-4" />;
  }
  return <ShoppingBasket className="size-3.5 sm:size-4" />;
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  const lowStock = product.stock <= product.minimumStock;

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={product.stock <= 0}
      className={cn(
        "group flex min-h-[100px] flex-col justify-between rounded-xl border border-border bg-card p-2.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[140px] sm:p-3.5",
        lowStock && "border-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground sm:size-9 sm:rounded-lg">
          <ProductCategoryIcon category={product.category} />
        </div>
        <Badge
          variant={lowStock ? "destructive" : "secondary"}
          className="rounded-full px-1.5 py-0 text-[9px] sm:px-2 sm:text-[10px]"
        >
          {product.stock} stok
        </Badge>
      </div>

      <div className="mt-1.5 space-y-0.5 sm:mt-2 sm:space-y-1">
        <p className="font-heading text-xs font-semibold leading-tight sm:text-sm">{product.name}</p>
        <p className="text-[10px] text-muted-foreground sm:text-xs">{product.category}</p>
      </div>

      <div className="mt-1.5 flex items-end justify-between gap-2 sm:mt-2">
        <p className="font-heading text-sm font-semibold sm:text-base">{formatCurrency(product.sellPrice)}</p>
        <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground opacity-100 transition sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-xs sm:opacity-0 sm:group-hover:opacity-100">
          + Tambah
        </span>
      </div>
    </button>
  );
}

export function KasirView() {
  const {
    products,
    cartLines,
    cartTotal,
    paymentMethod,
    settings,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    setPaymentMethod,
    checkout,
  } = useAppState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Semua" | ProductCategory>("Semua");

  const filteredProducts = products.filter((product) => {
    const queryMatch =
      query.length === 0 ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase());
    const categoryMatch = category === "Semua" || product.category === category;
    return queryMatch && categoryMatch;
  });

  async function handleCheckout() {
    try {
      const transaction = await checkout();
      if (!transaction) {
        toast.error("Keranjang masih kosong.");
        return;
      }

      const lowProducts = transaction.items.reduce<Product[]>((items, item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        if (!product) return items;
        if (product.stock - item.quantity <= product.minimumStock) items.push(product);
        return items;
      }, []);

      toast.success("Transaksi berhasil disimpan.", {
        description: `${transaction.items.length} produk masuk ke penjualan ${paymentLabels[transaction.paymentMethod]}.`,
      });

      if (lowProducts.length > 0) {
        toast.warning("Ada produk yang mendekati stok minimum.", {
          description: `Siapkan restok untuk ${lowProducts.slice(0, 2).map((item) => item.name).join(", ")}.`,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan transaksi.");
    }
  }

  return (
    <div className="grid gap-3 xl:grid-cols-[1.7fr_0.95fr]">
      <div>
        <Card>
          <CardHeader className="flex flex-col gap-2 pb-3 sm:gap-3 md:flex-row md:items-center md:justify-between sm:pb-4">
            <div>
              <CardTitle className="font-heading text-base sm:text-lg">Produk siap jual</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Cari produk, tap item, lalu lanjut ke keranjang.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2 md:flex-row md:items-center">
              <div className="relative min-w-[180px]">
                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari produk..."
                  className="h-8 rounded-lg border-border bg-muted/50 pl-8 text-xs sm:h-9 sm:text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {categoryLabels.map((item) => (
                  <Button
                    key={item.value}
                    type="button"
                    variant={category === item.value ? "default" : "ghost"}
                    size="sm"
                    className="rounded-lg px-2 py-1 text-[10px] sm:text-xs"
                    onClick={() => setCategory(item.value)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => {
                      addToCart(product.id);
                      toast.success(`${product.name} ditambahkan.`, {
                        description: `Stok: ${product.stock} pcs.`,
                      });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center sm:min-h-[200px]">
                <PackageSearch className="size-6 text-muted-foreground sm:size-8" />
                <p className="mt-2 font-heading text-sm font-semibold sm:mt-3 sm:text-base">Produk tidak ditemukan</p>
                <p className="mt-1 max-w-sm text-[10px] text-muted-foreground sm:text-xs">
                  Coba kata kunci lain atau pilih kategori yang berbeda.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-3">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-base sm:text-lg">Keranjang</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Item yang sudah ditap.</CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-full text-[10px] sm:text-xs">{cartLines.length} item</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-3">
            <ScrollArea className="h-[200px] rounded-lg border border-border bg-muted/30 p-2 sm:h-[260px] sm:p-2.5">
              {cartLines.length > 0 ? (
                <div className="space-y-1.5 sm:space-y-2">
                  {cartLines.map((line) => (
                    <div
                      key={line.product.id}
                      className="rounded-lg border border-border bg-card p-2 sm:p-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs sm:text-sm font-medium">{line.product.name}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatCurrency(line.product.sellPrice)} / item
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(line.product.id)}
                          className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          aria-label={`Hapus ${line.product.name}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between gap-2 sm:mt-2">
                        <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted px-1 py-0.5 sm:gap-1 sm:px-1.5">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="size-5 rounded-md sm:size-6"
                            onClick={() => updateCartQuantity(line.product.id, line.quantity - 1)}
                          >
                            <Minus className="size-2.5 sm:size-3" />
                          </Button>
                          <span className="min-w-4 text-center text-[10px] font-semibold sm:min-w-5 sm:text-xs">{line.quantity}</span>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="size-5 rounded-md sm:size-6"
                            onClick={() => updateCartQuantity(line.product.id, line.quantity + 1)}
                          >
                            <Plus className="size-2.5 sm:size-3" />
                          </Button>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold">{formatCurrency(line.lineTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-[150px] flex-col items-center justify-center text-center sm:min-h-[200px]">
                  <ReceiptText className="size-6 text-muted-foreground sm:size-8" />
                  <p className="mt-2 font-heading text-xs font-semibold sm:mt-3 sm:text-sm">Belum ada item</p>
                  <p className="mt-1 max-w-[180px] text-[10px] text-muted-foreground sm:max-w-[200px] sm:text-xs">
                    Tap produk dari sisi kiri untuk mulai transaksi.
                  </p>
                </div>
              )}
            </ScrollArea>

            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Metode bayar</p>
              <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                {settings.enabledPayments.map((method) => (
                  <Button
                    key={method}
                    type="button"
                    variant={paymentMethod === method ? "default" : "outline"}
                    size="sm"
                    className="h-8 rounded-lg text-[10px] sm:h-9 sm:text-xs"
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method === "Tunai" ? <BanknoteArrowDown className="size-3 sm:size-3.5" /> : <CreditCard className="size-3 sm:size-3.5" />}
                    {paymentLabels[method]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-primary p-3 text-primary-foreground sm:p-3.5">
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-primary-foreground/60">
                <span>Total</span>
                <span>{cartLines.reduce((sum, line) => sum + line.quantity, 0)} pcs</span>
              </div>
              <p className="mt-1.5 font-heading text-xl sm:mt-2 sm:text-2xl font-semibold tracking-tight">
                {formatCurrency(cartTotal)}
              </p>
              <Button
                type="button"
                size="lg"
                className="mt-2 h-9 w-full rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 sm:mt-2.5 sm:h-10"
                onClick={() => void handleCheckout()}
              >
                Bayar sekarang
              </Button>
              <p className="mt-1.5 text-[9px] text-primary-foreground/50 sm:mt-2 sm:text-[10px]">
                Stok akan otomatis berkurang setelah transaksi.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
