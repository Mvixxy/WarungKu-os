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

function ProductCategoryIcon({ category }: { category: ProductCategory }) {
  if (category === "Minuman") return <Coffee className="size-3.5 sm:size-4" />;
  if (category === "Sembako") return <Wheat className="size-3.5 sm:size-4" />;
  if (category === "Kebutuhan Harian") return <Sparkles className="size-3.5 sm:size-4" />;
  return <ShoppingBasket className="size-3.5 sm:size-4" />;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
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
        <Badge variant={lowStock ? "destructive" : "secondary"} className="rounded-full px-1.5 py-0 text-[9px] sm:px-2 sm:text-[10px]">
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

function DesktopCart({
  cartLines, cartTotal, paymentMethod, settings,
  updateCartQuantity, removeFromCart, setPaymentMethod, handleCheckout,
}: {
  cartLines: any[]; cartTotal: number; paymentMethod: PaymentMethod; settings: any;
  updateCartQuantity: (id: string, qty: number) => void; removeFromCart: (id: string) => void;
  setPaymentMethod: (m: PaymentMethod) => void; handleCheckout: () => void;
}) {
  return (
    <Card className="sticky top-3">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-base sm:text-lg">Keranjang</CardTitle>
            <CardDescription>Item yang sudah ditap.</CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full text-xs">{cartLines.length} item</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-[260px] rounded-lg border border-border bg-muted/30 p-2.5">
          {cartLines.length > 0 ? (
            <div className="space-y-2">
              {cartLines.map((line) => (
                <div key={line.product.id} className="rounded-lg border border-border bg-card p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{line.product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(line.product.sellPrice)} / item</p>
                    </div>
                    <button type="button" onClick={() => removeFromCart(line.product.id)} className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1 rounded-lg bg-muted px-1.5 py-0.5">
                      <Button type="button" size="icon-sm" variant="ghost" className="size-6 rounded-md" onClick={() => updateCartQuantity(line.product.id, line.quantity - 1)}>
                        <Minus className="size-3" />
                      </Button>
                      <span className="min-w-5 text-center text-xs font-semibold">{line.quantity}</span>
                      <Button type="button" size="icon-sm" variant="ghost" className="size-6 rounded-md" onClick={() => updateCartQuantity(line.product.id, line.quantity + 1)}>
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(line.lineTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
              <ReceiptText className="size-8 text-muted-foreground" />
              <p className="mt-3 font-heading text-sm font-semibold">Belum ada item</p>
              <p className="mt-1 max-w-[180px] text-xs text-muted-foreground">Tap produk untuk mulai transaksi.</p>
            </div>
          )}
        </ScrollArea>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Metode bayar</p>
          <div className="grid grid-cols-3 gap-1.5">
            {settings.enabledPayments.map((method: PaymentMethod) => (
              <Button key={method} type="button" variant={paymentMethod === method ? "default" : "outline"} size="sm" className="h-9 rounded-lg text-xs" onClick={() => setPaymentMethod(method)}>
                {method === "Tunai" ? <BanknoteArrowDown className="size-3.5" /> : <CreditCard className="size-3.5" />}
                {paymentLabels[method]}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-primary p-3.5 text-primary-foreground">
          <div className="flex items-center justify-between text-xs text-primary-foreground/60">
            <span>Total</span>
            <span>{cartLines.reduce((sum: number, line: any) => sum + line.quantity, 0)} pcs</span>
          </div>
          <p className="mt-2 font-heading text-2xl font-semibold tracking-tight">{formatCurrency(cartTotal)}</p>
          <Button type="button" size="lg" className="mt-2.5 h-10 w-full rounded-lg bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" onClick={handleCheckout}>
            Bayar sekarang
          </Button>
          <p className="mt-2 text-[10px] text-primary-foreground/50">Stok akan otomatis berkurang setelah transaksi.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MobileCartSheet({
  open, onOpenChange, cartLines, cartTotal, paymentMethod, settings,
  updateCartQuantity, removeFromCart, setPaymentMethod, handleCheckout,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  cartLines: any[]; cartTotal: number; paymentMethod: PaymentMethod; settings: any;
  updateCartQuantity: (id: string, qty: number) => void; removeFromCart: (id: string) => void;
  setPaymentMethod: (m: PaymentMethod) => void; handleCheckout: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => onOpenChange(false)} />
      )}
      {/* Sheet */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card shadow-lg transition-transform duration-300 lg:hidden",
        open ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/30" />
        <div className="max-h-[70vh] overflow-y-auto p-4 pt-2">
          <p className="mb-3 text-sm font-semibold">Keranjang ({cartLines.length} item)</p>

          {cartLines.length > 0 ? (
            <div className="space-y-2">
              {cartLines.map((line) => (
                <div key={line.product.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.product.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(line.product.sellPrice)} / item</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 rounded-lg bg-card px-1.5 py-0.5">
                      <Button type="button" size="icon-sm" variant="ghost" className="size-6 rounded-md" onClick={() => updateCartQuantity(line.product.id, line.quantity - 1)}>
                        <Minus className="size-3" />
                      </Button>
                      <span className="min-w-5 text-center text-xs font-semibold">{line.quantity}</span>
                      <Button type="button" size="icon-sm" variant="ghost" className="size-6 rounded-md" onClick={() => updateCartQuantity(line.product.id, line.quantity + 1)}>
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <p className="w-16 text-right text-xs font-semibold">{formatCurrency(line.lineTotal)}</p>
                    <button type="button" onClick={() => removeFromCart(line.product.id)} className="rounded p-0.5 text-muted-foreground">
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">Belum ada item di keranjang.</div>
          )}

          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Metode bayar</p>
            <div className="grid grid-cols-3 gap-1.5">
              {settings.enabledPayments.map((method: PaymentMethod) => (
                <Button key={method} type="button" variant={paymentMethod === method ? "default" : "outline"} size="sm" className="h-8 rounded-lg text-[11px]" onClick={() => setPaymentMethod(method)}>
                  {method === "Tunai" ? <BanknoteArrowDown className="size-3" /> : <CreditCard className="size-3" />}
                  {paymentLabels[method]}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-primary p-3 text-primary-foreground">
            <div className="flex items-center justify-between text-[10px] text-primary-foreground/60">
              <span>Total</span>
              <span>{cartLines.reduce((sum: number, line: any) => sum + line.quantity, 0)} pcs</span>
            </div>
            <p className="mt-1.5 font-heading text-xl font-semibold">{formatCurrency(cartTotal)}</p>
          </div>
          <Button type="button" size="lg" className="mt-2 h-11 w-full rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md" onClick={() => { handleCheckout(); onOpenChange(false); }}>
            Bayar sekarang — {formatCurrency(cartTotal)}
          </Button>
        </div>
      </div>
    </>
  );
}

export function KasirView() {
  const {
    products, cartLines, cartTotal, paymentMethod, settings,
    addToCart, updateCartQuantity, removeFromCart, setPaymentMethod, checkout,
  } = useAppState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Semua" | ProductCategory>("Semua");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const allCategories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((product) => {
    const queryMatch = query.length === 0 || product.name.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase());
    const categoryMatch = category === "Semua" || product.category === category;
    return queryMatch && categoryMatch;
  });

  const totalItems = cartLines.reduce((sum: number, line: any) => sum + line.quantity, 0);

  async function handleCheckout() {
    try {
      const transaction = await checkout();
      if (!transaction) { toast.error("Keranjang masih kosong."); return; }
      const lowProducts = transaction.items.reduce<Product[]>((items, item) => {
        const product = products.find((c) => c.id === item.productId);
        if (!product) return items;
        if (product.stock - item.quantity <= product.minimumStock) items.push(product);
        return items;
      }, []);
      toast.success("Transaksi berhasil disimpan.", { description: `${transaction.items.length} produk masuk ke penjualan ${paymentLabels[transaction.paymentMethod]}.` });
      if (lowProducts.length > 0) {
        toast.warning("Ada produk yang mendekati stok minimum.", { description: `Siapkan restok untuk ${lowProducts.slice(0, 2).map((i) => i.name).join(", ")}.` });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan transaksi.");
    }
  }

  return (
    <div className="flex h-full flex-col xl:h-auto xl:grid xl:grid-cols-[1.7fr_0.95fr] xl:gap-3">
      {/* Products */}
      <div className="min-h-0 flex-1 overflow-y-auto pb-20 xl:pb-0">
        <Card>
          <CardHeader className="space-y-2.5 p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-heading text-base sm:text-lg">Produk siap jual</CardTitle>
                <CardDescription className="text-xs">Cari produk, tap item, lalu lanjut ke keranjang.</CardDescription>
              </div>
              <div className="relative shrink-0 sm:min-w-[200px]">
                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk..." className="h-8 rounded-lg border-border bg-muted/50 pl-8 text-xs sm:h-9 sm:text-sm" />
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              <Button type="button" variant={category === "Semua" ? "default" : "ghost"} size="sm" className="shrink-0 rounded-full px-3 py-1 text-[10px] sm:text-xs" onClick={() => setCategory("Semua")}>
                Semua
              </Button>
              {allCategories.map((cat) => (
                <Button key={cat} type="button" variant={category === cat ? "default" : "ghost"} size="sm" className="shrink-0 rounded-full px-3 py-1 text-[10px] sm:text-xs" onClick={() => setCategory(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={() => { addToCart(product.id); toast.success(`${product.name} ditambahkan.`, { description: `Stok: ${product.stock} pcs.` }); }} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center sm:min-h-[200px]">
                <PackageSearch className="size-6 text-muted-foreground sm:size-8" />
                <p className="mt-2 font-heading text-sm font-semibold sm:text-base">Produk tidak ditemukan</p>
                <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Coba kata kunci lain atau pilih kategori.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desktop: sticky cart */}
      <div className="hidden xl:block">
        <DesktopCart
          cartLines={cartLines} cartTotal={cartTotal} paymentMethod={paymentMethod} settings={settings}
          updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart}
          setPaymentMethod={setPaymentMethod} handleCheckout={() => void handleCheckout()}
        />
      </div>

      {/* Mobile: compact floating bar */}
      <div className="fixed bottom-14 left-2 right-2 z-30 lg:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-lg"
          onClick={() => setMobileCartOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShoppingBasket className="size-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground">{totalItems} item di keranjang</p>
              <p className="font-heading text-base font-semibold tracking-tight">{formatCurrency(cartTotal)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary transition-colors">
            Buka
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </button>
      </div>

      {/* Mobile: full cart sheet */}
      <MobileCartSheet
        open={mobileCartOpen} onOpenChange={setMobileCartOpen}
        cartLines={cartLines} cartTotal={cartTotal} paymentMethod={paymentMethod} settings={settings}
        updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart}
        setPaymentMethod={setPaymentMethod} handleCheckout={() => void handleCheckout()}
      />
    </div>
  );
}
