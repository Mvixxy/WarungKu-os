"use client";

import { useState } from "react";
import {
  BanknoteArrowDown,
  Coffee,
  CreditCard,
  Minus,
  PackageSearch,
  Plus,
  ReceiptText,
  Search,
  ShoppingBasket,
  Sparkles,
  Wallet,
  Wheat,
  Loader2,
  Printer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/components/providers/app-state-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/format";
import { PaymentMethod, Product, ProductCategory, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const paymentLabels: Record<PaymentMethod, string> = {
  Tunai: "Tunai",
  QRIS: "QRIS",
  Hutang: "Hutang",
};

function ProductCategoryIcon({ category }: { category: ProductCategory }) {
  if (category === "Minuman")
    return <Coffee className="size-3.5 sm:size-4" />;
  if (category === "Sembako")
    return <Wheat className="size-3.5 sm:size-4" />;
  if (category === "Kebutuhan Harian")
    return <Sparkles className="size-3.5 sm:size-4" />;
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
        <p className="font-heading text-xs font-semibold leading-tight sm:text-sm">
          {product.name}
        </p>
        <p className="text-[10px] text-muted-foreground sm:text-xs">
          {product.category}
        </p>
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-2 sm:mt-2">
        <p className="font-heading text-sm font-semibold sm:text-base">
          {formatCurrency(product.sellPrice)}
        </p>
        <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground opacity-100 transition sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-xs sm:opacity-0 sm:group-hover:opacity-100">
          + Tambah
        </span>
      </div>
    </button>
  );
}

function DesktopCart({
  cartLines,
  cartTotal,
  paymentMethod,
  settings,
  updateCartQuantity,
  removeFromCart,
  setPaymentMethod,
  handleCheckout,
  checkingOut,
}: {
  cartLines: any[];
  cartTotal: number;
  paymentMethod: PaymentMethod;
  settings: any;
  updateCartQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  handleCheckout: () => void;
  checkingOut: boolean;
}) {
  return (
    <Card className="sticky top-3">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-base sm:text-lg">
              Keranjang
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Item yang sudah ditap.</CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full text-xs">
            {cartLines.length} item
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-[260px] rounded-lg border border-border bg-muted/30 p-2.5">
          {cartLines.length > 0 ? (
            <div className="space-y-2">
              {cartLines.map((line) => (
                <div
                  key={line.product.id}
                  className="rounded-lg border border-border bg-card p-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        {line.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(line.product.sellPrice)} / item
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(line.product.id)}
                      className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1 rounded-lg bg-muted px-1.5 py-0.5">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="size-6 rounded-md"
                        onClick={() =>
                          updateCartQuantity(
                            line.product.id,
                            line.quantity - 1
                          )
                        }
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="min-w-5 text-center text-xs font-semibold">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="size-6 rounded-md"
                        onClick={() =>
                          updateCartQuantity(
                            line.product.id,
                            line.quantity + 1
                          )
                        }
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(line.lineTotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
              <ReceiptText className="size-8 text-muted-foreground" />
              <p className="mt-3 font-heading text-sm font-semibold">
                Belum ada item
              </p>
              <p className="mt-1 max-w-[180px] text-xs text-muted-foreground">
                Tap produk untuk mulai transaksi.
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Metode bayar
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {settings.enabledPayments.map((method: PaymentMethod) => (
              <Button
                key={method}
                type="button"
                variant={paymentMethod === method ? "default" : "outline"}
                size="sm"
                className="h-9 rounded-lg text-xs"
                onClick={() => setPaymentMethod(method)}
              >
                {method === "Tunai" ? (
                  <BanknoteArrowDown className="size-3.5" />
                ) : (
                  <CreditCard className="size-3.5" />
                )}
                {paymentLabels[method]}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-primary p-3.5 text-primary-foreground">
          <div className="flex items-center justify-between text-xs sm:text-sm text-primary-foreground/60">
            <span>Total</span>
            <span>
              {cartLines.reduce(
                (sum: number, line: any) => sum + line.quantity,
                0
              )}{" "}
              pcs
            </span>
          </div>
          <p className="mt-2 font-heading text-2xl font-semibold tracking-tight">
            {formatCurrency(cartTotal)}
          </p>
          <Button
            type="button"
            size="lg"
            className="mt-2.5 h-11 w-full rounded-xl bg-white text-primary font-semibold shadow-sm hover:bg-white/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? (<><Loader2 className="mr-2 size-4 animate-spin" />Memproses...</>) : "Bayar sekarang"}
          </Button>
          <p className="mt-2 text-[10px] sm:text-xs text-primary-foreground/50">
            Stok akan otomatis berkurang setelah transaksi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MobileCartSheet({
  open,
  onOpenChange,
  cartLines,
  cartTotal,
  paymentMethod,
  settings,
  updateCartQuantity,
  removeFromCart,
  setPaymentMethod,
  handleCheckout,
  checkingOut,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cartLines: any[];
  cartTotal: number;
  paymentMethod: PaymentMethod;
  settings: any;
  updateCartQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  handleCheckout: () => void;
  checkingOut: boolean;
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}
      {/* Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-card shadow-lg transition-transform duration-300 lg:hidden",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/30" />
        <div className="max-h-[70vh] overflow-y-auto p-4 pt-2">
          <p className="mb-3 text-sm font-semibold">
            Keranjang ({cartLines.length} item)
          </p>

          {cartLines.length > 0 ? (
            <div className="space-y-2">
              {cartLines.map((line) => (
                <div
                  key={line.product.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {line.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(line.product.sellPrice)} / item
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 rounded-lg bg-card px-1.5 py-0.5">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="size-6 rounded-md"
                        onClick={() =>
                          updateCartQuantity(
                            line.product.id,
                            line.quantity - 1
                          )
                        }
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="min-w-5 text-center text-xs font-semibold">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="size-6 rounded-md"
                        onClick={() =>
                          updateCartQuantity(
                            line.product.id,
                            line.quantity + 1
                          )
                        }
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <p className="w-16 text-right text-xs font-semibold">
                      {formatCurrency(line.lineTotal)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(line.product.id)}
                      className="rounded p-0.5 text-muted-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Belum ada item di keranjang.
            </div>
          )}

          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Metode bayar
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {settings.enabledPayments.map((method: PaymentMethod) => (
                <Button
                  key={method}
                  type="button"
                  variant={paymentMethod === method ? "default" : "outline"}
                  size="sm"
                  className="h-8 rounded-lg text-[11px]"
                  onClick={() => setPaymentMethod(method)}
                >
                  {method === "Tunai" ? (
                    <BanknoteArrowDown className="size-3" />
                  ) : (
                    <CreditCard className="size-3" />
                  )}
                  {paymentLabels[method]}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-primary p-3 text-primary-foreground">
            <div className="flex items-center justify-between text-[10px] text-primary-foreground/60">
              <span>Total</span>
              <span>
                {cartLines.reduce(
                  (sum: number, line: any) => sum + line.quantity,
                  0
                )}{" "}
                pcs
              </span>
            </div>
            <p className="mt-1.5 font-heading text-xl font-semibold">
              {formatCurrency(cartTotal)}
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            className="mt-2 h-11 w-full rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md"
            onClick={() => {
              handleCheckout();
              onOpenChange(false);
            }}
            disabled={checkingOut}
          >
            {checkingOut ? (<><Loader2 className="mr-2 size-4 animate-spin" />Memproses...</>) : `Bayar sekarang — ${formatCurrency(cartTotal)}`}
          </Button>
        </div>
      </div>
    </>
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
    addDebt,
  } = useAppState();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Semua" | ProductCategory>("Semua");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [debtFormOpen, setDebtFormOpen] = useState(false);
  const [debtDraft, setDebtDraft] = useState({
    borrowerName: "",
    whatsapp: "",
    dueDate: "",
  });
  const [checkingOut, setCheckingOut] = useState(false);
  const [receiptTransaction, setReceiptTransaction] = useState<{
    transaction: Transaction;
    cashGiven?: number;
  } | null>(null);

  const allCategories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((product) => {
    const queryMatch =
      query.length === 0 ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase());
    const categoryMatch =
      category === "Semua" || product.category === category;
    return queryMatch && categoryMatch;
  });

  const totalItems = cartLines.reduce(
    (sum: number, line: any) => sum + line.quantity,
    0
  );

  async function handleCheckout(skipDebt = false) {
    if (paymentMethod === "Hutang" && !skipDebt) {
      setMobileCartOpen(false);
      setDebtFormOpen(true);
      return;
    }
    setCheckingOut(true);
    try {
      const transaction = await checkout();
      if (!transaction) {
        toast.error("Keranjang masih kosong.");
        return;
      }
      const lowProducts = transaction.items.reduce<Product[]>(
        (items, item) => {
          const product = products.find((c) => c.id === item.productId);
          if (!product) return items;
          if (product.stock - item.quantity <= product.minimumStock)
            items.push(product);
          return items;
        },
        []
      );
      if (transaction.paymentMethod !== "Hutang") {
        setReceiptTransaction({ transaction });
      } else {
        toast.success("Transaksi berhasil disimpan.", {
          description: `${transaction.items.length} produk masuk ke penjualan ${paymentLabels[transaction.paymentMethod]}.`,
        });
      }
      if (lowProducts.length > 0) {
        toast.warning("Ada produk yang mendekati stok minimum.", {
          description: `Siapkan restok untuk ${lowProducts
            .slice(0, 2)
            .map((i) => i.name)
            .join(", ")}.`,
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan transaksi."
      );
    } finally {
      setCheckingOut(false);
    }
  }

  async function handleCheckoutWithDebt() {
    try {
      if (!debtDraft.borrowerName.trim()) {
        toast.error("Nama pelanggan wajib diisi.");
        return;
      }
      const transaction = await checkout();
      if (!transaction) {
        toast.error("Keranjang masih kosong.");
        return;
      }
      await addDebt({
        borrowerName: debtDraft.borrowerName.trim(),
        whatsapp: debtDraft.whatsapp.trim(),
        amount: transaction.total,
        dueDate:
          debtDraft.dueDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
      });
      setDebtFormOpen(false);
      setDebtDraft({ borrowerName: "", whatsapp: "", dueDate: "" });
      toast.success("Transaksi tersimpan sebagai hutang.", {
        description: `${debtDraft.borrowerName} berhutang ${formatCurrency(transaction.total)}.`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan transaksi."
      );
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
                <CardTitle className="font-heading text-base sm:text-lg">
                  Produk siap jual
                </CardTitle>
                <CardDescription className="text-xs">
                  Cari produk, tap item, lalu lanjut ke keranjang.
                </CardDescription>
              </div>
              <div className="relative shrink-0 sm:min-w-[200px]">
                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="h-8 rounded-lg border-border bg-muted/50 pl-8 text-xs sm:h-9 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              <Button
                type="button"
                variant={category === "Semua" ? "default" : "ghost"}
                size="sm"
                className="shrink-0 rounded-full px-3 py-1 text-[10px] sm:text-xs"
                onClick={() => setCategory("Semua")}
              >
                Semua
              </Button>
              {allCategories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={category === cat ? "default" : "ghost"}
                  size="sm"
                  className="shrink-0 rounded-full px-3 py-1 text-[10px] sm:text-xs"
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 xl:grid-cols-3">
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
                <p className="mt-2 font-heading text-sm font-semibold sm:text-base">
                  Produk tidak ditemukan
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                  Coba kata kunci lain atau pilih kategori.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desktop: sticky cart */}
      <div className="hidden xl:block">
        <DesktopCart
          cartLines={cartLines}
          cartTotal={cartTotal}
          paymentMethod={paymentMethod}
          settings={settings}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          setPaymentMethod={setPaymentMethod}
          handleCheckout={() => void handleCheckout(false)}
          checkingOut={checkingOut}
        />
      </div>

      {/* Mobile: compact floating bar */}
      <div className="fixed bottom-16 left-2 right-2 z-30 lg:hidden">
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
              <p className="text-[10px] text-muted-foreground">
                {totalItems} item di keranjang
              </p>
              <p className="font-heading text-base font-semibold tracking-tight">
                {formatCurrency(cartTotal)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary transition-colors">
            Buka
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Mobile: full cart sheet */}
      <MobileCartSheet
        open={mobileCartOpen}
        onOpenChange={setMobileCartOpen}
        cartLines={cartLines}
        cartTotal={cartTotal}
        paymentMethod={paymentMethod}
        settings={settings}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        setPaymentMethod={setPaymentMethod}
        handleCheckout={() => void handleCheckout(false)}
        checkingOut={checkingOut}
      />

      {/* Debt form popup */}
      {debtFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setDebtFormOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card shadow-lg transition-all duration-300 sm:bottom-auto sm:max-h-[80vh] sm:max-w-sm sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl",
          debtFormOpen
            ? "translate-y-0 sm:mx-auto sm:translate-y-[-50%] sm:top-1/2 sm:opacity-100 sm:scale-100"
            : "translate-y-full sm:mx-auto sm:translate-y-[-50%] sm:top-1/2 sm:opacity-0 sm:scale-95 sm:pointer-events-none"
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/30 sm:mt-3" />
        <div className="p-4 pt-3">
          <p className="text-sm sm:text-base font-semibold">Data pelanggan hutang</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Isi data di bawah untuk mencatat hutang.
          </p>

          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">
                Nama pelanggan *
              </label>
              <input
                type="text"
                value={debtDraft.borrowerName}
                onChange={(e) =>
                  setDebtDraft((d) => ({
                    ...d,
                    borrowerName: e.target.value,
                  }))
                }
                placeholder="Contoh: Pak Budi"
                className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                value={debtDraft.whatsapp}
                onChange={(e) =>
                  setDebtDraft((d) => ({
                    ...d,
                    whatsapp: e.target.value,
                  }))
                }
                placeholder="08xxxxxxxxxx"
                className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Jatuh tempo</label>
              <input
                type="date"
                value={debtDraft.dueDate}
                onChange={(e) =>
                  setDebtDraft((d) => ({
                    ...d,
                    dueDate: e.target.value,
                  }))
                }
                className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-[10px] text-muted-foreground">
                Kosongkan = 7 hari dari sekarang
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground">
                Total hutang
              </p>
              <p className="font-heading text-xl font-semibold text-primary">
                {formatCurrency(cartTotal)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg"
                onClick={() => setDebtFormOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 rounded-lg"
                onClick={() => void handleCheckoutWithDebt()}
                disabled={checkingOut}
              >
                {checkingOut ? (<><Loader2 className="mr-1.5 size-3.5 animate-spin" />Menyimpan...</>) : "Simpan hutang"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Popup */}
      {receiptTransaction && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setReceiptTransaction(null)}
          />
          <div className="fixed inset-x-0 bottom-0 z-[60] max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card shadow-2xl sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:rounded-2xl">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
            <div className="p-5">
              {/* Receipt content */}
              <div id="receipt-content" className="space-y-4">
                <div className="text-center">
                  <p className="font-heading text-lg font-bold">{settings.storeName || "WarungKu"}</p>
                  {settings.storeAddress && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{settings.storeAddress}{settings.city ? `, ${settings.city}` : ""}</p>
                  )}
                  {settings.ownerWhatsapp && (
                    <p className="text-[10px] text-muted-foreground">Telp: {settings.ownerWhatsapp}</p>
                  )}
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">No. Transaksi</span>
                    <span className="font-mono">{receiptTransaction.transaction.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal</span>
                    <span>{new Date(receiptTransaction.transaction.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metode</span>
                    <span>{paymentLabels[receiptTransaction.transaction.paymentMethod as PaymentMethod]}</span>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  {receiptTransaction.transaction.items.map((item: { productName: string; quantity: number; unitPrice: number }, i: number) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between">
                        <span>{item.productName}</span>
                        <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="font-heading text-base">{formatCurrency(receiptTransaction.transaction.total)}</span>
                  </div>
                  {receiptTransaction.transaction.paymentMethod === "Tunai" && receiptTransaction.cashGiven != null && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Dibayar</span>
                        <span>{formatCurrency(receiptTransaction.cashGiven)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-primary">
                        <span>Kembali</span>
                        <span>{formatCurrency(receiptTransaction.cashGiven - receiptTransaction.transaction.total)}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="h-px bg-border" />
                <p className="text-center text-[10px] text-muted-foreground">Terima kasih atas kunjungan Anda!</p>
              </div>

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const t = receiptTransaction.transaction;
                    const itemLines = t.items.map(
                      (item: { productName: string; quantity: number; unitPrice: number }) => `  ${item.productName}  ${item.quantity}x  ${formatCurrency(item.unitPrice * item.quantity)}`
                    ).join("\n");
                    const storeName = settings.storeName || "WarungKu";
                    const addr = settings.storeAddress ? `${settings.storeAddress}${settings.city ? ", " + settings.city : ""}` : "";
                    const date = new Date(t.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
                    const msg = [
                      `*${storeName}*`,
                      addr,
                      `─────────────`,
                      `No: ${t.id.slice(-8).toUpperCase()}`,
                      `Tanggal: ${date}`,
                      `Bayar: ${paymentLabels[t.paymentMethod as PaymentMethod]}`,
                      `─────────────`,
                      itemLines,
                      `─────────────`,
                      `*Total: ${formatCurrency(t.total)}*`,
                      ``,
                      `Terima kasih!`,
                    ].join("\n");
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-2.5 text-[10px] font-medium transition hover:bg-muted"
                >
                  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.627.616l4.584-1.202A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.82-6.293-2.192l-.44-.356-2.64.693.706-2.575-.385-.456A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const printContent = document.getElementById("receipt-content");
                    if (!printContent) return;
                    const w = window.open("", "_blank", "width=400,height=600");
                    if (!w) return;
                    w.document.write(`<!DOCTYPE html><html><head><title>Struk</title><style>
                      body{font-family:monospace;max-width:320px;margin:0 auto;padding:16px;font-size:13px;color:#000}
                      .text-center{text-align:center}.font-bold{font-weight:700}
                      .font-heading{font-weight:700;font-size:16px}
                      .text-muted{color:#666;font-size:11px}.text-xs{font-size:12px}.text-[10px]{font-size:10px}
                      .text-base{font-size:14px}.space-y-1>div{margin-bottom:4px}.space-y-2>div{margin-bottom:6px}
                      .space-y-1\.5>div{margin-bottom:5px}
                      hr{border:none;border-top:1px dashed #ccc;margin:10px 0}
                      .flex{display:flex}.justify-between{justify-content:space-between}
                    </style></head><body>${printContent.innerHTML}</body></html>`);
                    w.document.close();
                    w.focus();
                    setTimeout(() => { w.print(); }, 300);
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-2.5 text-[10px] font-medium transition hover:bg-muted"
                >
                  <Printer className="size-5" />
                  Cetak
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptTransaction(null)}
                  className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-2.5 text-[10px] font-medium transition hover:bg-muted"
                >
                  <X className="size-5" />
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
