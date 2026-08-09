"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { emptyAppState } from "@/lib/empty-state";
import { AppState, Debt, Expense, DebtDraft, PaymentMethod, Product, ProductDraft, Settings, Transaction } from "@/lib/types";

type CartLine = {
  product: Product;
  quantity: number;
  lineTotal: number;
};

type AppStateContextValue = AppState & {
  isLoading: boolean;
  error: string | null;
  cartLines: CartLine[];
  cartTotal: number;
  lowStockProducts: Product[];
  addToCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  checkout: () => Promise<Transaction | null>;
  addProduct: (draft: ProductDraft) => Promise<void>;
  updateProduct: (productId: string, draft: ProductDraft) => Promise<void>;
  restockProduct: (productId: string, quantity: number) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addDebt: (draft: DebtDraft) => Promise<void>;
  deleteDebt: (debtId: string) => Promise<void>;
  addExpense: (draft: { title: string; amount: number; category: "Operasional" | "Belanja" | "Utilitas" }) => Promise<void>;
  updateExpense: (expenseId: string, draft: { title: string; amount: number; category: "Operasional" | "Belanja" | "Utilitas" }) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  partialPayDebt: (debtId: string, amount: number) => Promise<void>;
  markDebtPaid: (debtId: string) => Promise<void>;
  sendDebtReminder: (debtId: string) => Promise<Debt | null>;
  updateSettings: (settings: Settings) => Promise<void>;
  voidTransaction: (transactionId: string, reason: string) => Promise<void>;
  resetWorkspace: () => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  loadMoreDebts: () => Promise<void>;
  loadMoreExpenses: () => Promise<void>;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as T & { error?: string } | null;

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }

    throw new Error(data?.error ?? "Permintaan ke server gagal.");
  }

  return data as T;
}

export function AppStateProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [state, setState] = useState<AppState>(emptyAppState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending } = useSession();
  const sessionUserId = session?.user?.id ?? null;

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!sessionUserId) {
      setIsLoading(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setError(null);

    void requestJson<{ appState: AppState }>("/api/bootstrap")
      .then((response) => {
        if (!isActive) {
          return;
        }

        setState((current) => ({
          ...response.appState,
          cart: current.cart,
          paymentMethod: response.appState.settings.enabledPayments.includes(current.paymentMethod)
            ? current.paymentMethod
            : response.appState.paymentMethod,
        }));
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isActive) {
          return;
        }

        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          setState(emptyAppState);
          router.replace("/auth");
          return;
        }

        setError(err instanceof Error ? err.message : "Gagal memuat data. Periksa koneksi internet Anda.");
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isPending, router, sessionUserId]);

  const cartLines = state.cart.flatMap((line) => {
    const product = state.products.find((item) => item.id === line.productId);
    if (!product) {
      return [];
    }

    return [
      {
        product,
        quantity: line.quantity,
        lineTotal: product.sellPrice * line.quantity,
      },
    ];
  });

  const cartTotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);

  const lowStockProducts = state.products.filter(
    (product) => product.stock <= Math.max(product.minimumStock, state.settings.stockAlertThreshold)
  );

  function addToCart(productId: string) {
    setState((current) => {
      const product = current.products.find((item) => item.id === productId);
      if (!product || product.stock <= 0) {
        return current;
      }

      const existing = current.cart.find((item) => item.productId === productId);
      const nextCart = existing
        ? current.cart.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + 1, product.stock),
                }
              : item
          )
        : [...current.cart, { productId, quantity: 1 }];

      return {
        ...current,
        cart: nextCart,
      };
    });
  }

  function updateCartQuantity(productId: string, quantity: number) {
    setState((current) => {
      const product = current.products.find((item) => item.id === productId);
      if (!product) {
        return current;
      }

      const nextQuantity = Math.max(0, Math.min(quantity, product.stock));
      return {
        ...current,
        cart:
          nextQuantity === 0
            ? current.cart.filter((item) => item.productId !== productId)
            : current.cart.map((item) =>
                item.productId === productId ? { ...item, quantity: nextQuantity } : item
              ),
      };
    });
  }

  function removeFromCart(productId: string) {
    setState((current) => ({
      ...current,
      cart: current.cart.filter((item) => item.productId !== productId),
    }));
  }

  function setPaymentMethod(method: PaymentMethod) {
    setState((current) => ({
      ...current,
      paymentMethod: method,
    }));
  }

  async function checkout() {
    if (state.cart.length === 0) {
      return null;
    }

    const response = await requestJson<{
      transaction: Transaction;
      products: Product[];
    }>("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: state.paymentMethod,
        items: state.cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    });

    setState((current) => ({
      ...current,
      cart: [],
      transactions: [response.transaction, ...current.transactions],
      products: response.products,
    }));

    const transaction = response.transaction;
    return transaction;
  }

  async function addProduct(draft: ProductDraft) {
    const response = await requestJson<{ product: Product }>("/api/products", {
      method: "POST",
      body: JSON.stringify(draft),
    });

    setState((current) => ({
      ...current,
      products: [response.product, ...current.products],
    }));
  }

  async function updateProduct(productId: string, draft: ProductDraft) {
    const response = await requestJson<{ product: Product }>(`/api/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(draft),
    });

    setState((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === productId ? response.product : product
      ),
    }));
  }

  async function restockProduct(productId: string, quantity: number) {
    const response = await requestJson<{ product: Product }>(
      `/api/products/${productId}/restock`,
      {
        method: "POST",
        body: JSON.stringify({ quantity }),
      }
    );

    setState((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === productId ? response.product : product
      ),
    }));
  }

  async function deleteProduct(productId: string) {
    await requestJson(`/api/products/${productId}`, {
      method: "DELETE",
    });

    setState((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== productId),
    }));
  }

  async function deleteDebt(debtId: string) {
    await requestJson(`/api/debts/${debtId}`, { method: "DELETE" });
    setState((current) => ({
      ...current,
      debts: current.debts.filter((d) => d.id !== debtId),
    }));
  }

  async function addExpense(draft: { title: string; amount: number; category: "Operasional" | "Belanja" | "Utilitas" }) {
    const created = await requestJson<Expense>("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setState((prev) => ({ ...prev, expenses: [created, ...prev.expenses] }));
  }

  async function updateExpense(expenseId: string, draft: { title: string; amount: number; category: "Operasional" | "Belanja" | "Utilitas" }) {
    const response = await requestJson<{ expense: Expense }>(`/api/expenses/${expenseId}`, {
      method: "PATCH",
      body: JSON.stringify(draft),
    });
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === expenseId ? response.expense : e)),
    }));
  }

  async function deleteExpense(expenseId: string) {
    await requestJson(`/api/expenses/${expenseId}`, { method: "DELETE" });
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
    }));
  }

  async function partialPayDebt(debtId: string, amount: number) {
    const response = await requestJson<{ debt: Debt }>(`/api/debts/${debtId}/partial`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => (d.id === debtId ? response.debt : d)),
    }));
  }

  async function addDebt(draft: DebtDraft) {
    const response = await requestJson<{ debt: Debt }>("/api/debts", {
      method: "POST",
      body: JSON.stringify(draft),
    });

    setState((current) => ({
      ...current,
      debts: [response.debt, ...current.debts],
    }));
  }

  async function markDebtPaid(debtId: string) {
    const response = await requestJson<{ debt: Debt }>(`/api/debts/${debtId}`, {
      method: "PATCH",
      body: JSON.stringify({ isPaid: true }),
    });

    setState((current) => ({
      ...current,
      debts: current.debts.map((debt) =>
        debt.id === debtId ? response.debt : debt
      ),
    }));
  }

  async function sendDebtReminder(debtId: string) {
    const response = await requestJson<{ debt: Debt }>(`/api/debts/${debtId}/remind`, {
      method: "POST",
    });

    setState((current) => ({
      ...current,
      debts: current.debts.map((debt) =>
        debt.id === debtId ? response.debt : debt
      ),
    }));

    return response.debt;
  }

  async function updateSettings(settings: Settings) {
    const response = await requestJson<{ settings: Settings }>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });

    setState((current) => ({
      ...current,
      paymentMethod: response.settings.enabledPayments.includes(current.paymentMethod)
        ? current.paymentMethod
        : response.settings.enabledPayments[0] ?? "Tunai",
      settings: response.settings,
    }));
  }

  async function voidTransaction(transactionId: string, reason: string) {
    const response = await requestJson<{ transaction: Transaction }>(`/api/transactions/${transactionId}/void`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((t) =>
        t.id === transactionId ? response.transaction : t
      ),
      products: response.transaction.items.length > 0
        ? current.products // Products will be refreshed from bootstrap
        : current.products,
    }));
    // Refresh products to get updated stock
    const bootstrap = await requestJson<{ appState: AppState }>("/api/bootstrap");
    setState((current) => ({
      ...current,
      products: bootstrap.appState.products,
    }));
  }

  async function resetWorkspace() {
    const response = await requestJson<{ appState: AppState }>("/api/bootstrap/reset", {
      method: "POST",
    });
    setState((current) => ({
      ...response.appState,
      cart: [],
      paymentMethod: response.appState.settings.enabledPayments.includes(current.paymentMethod)
        ? current.paymentMethod
        : response.appState.paymentMethod,
    }));
  }

  async function loadMoreTransactions() {
    const currentCount = state.transactions.length;
    const response = await requestJson<{ transactions: Transaction[] }>(
      `/api/data/transactions?limit=20&offset=${currentCount}`
    );
    setState((current) => ({
      ...current,
      transactions: [...current.transactions, ...response.transactions],
    }));
  }

  async function loadMoreDebts() {
    const currentCount = state.debts.length;
    const response = await requestJson<{ debts: Debt[] }>(
      `/api/data/debts?limit=20&offset=${currentCount}`
    );
    setState((current) => ({
      ...current,
      debts: [...current.debts, ...response.debts],
    }));
  }

  async function loadMoreExpenses() {
    const currentCount = state.expenses.length;
    const response = await requestJson<{ expenses: Expense[] }>(
      `/api/data/expenses?limit=20&offset=${currentCount}`
    );
    setState((current) => ({
      ...current,
      expenses: [...current.expenses, ...response.expenses],
    }));
  }

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        isLoading,
        error,
        cartLines,
        cartTotal,
        lowStockProducts,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        setPaymentMethod,
        checkout,
        addProduct,
        updateProduct,
        restockProduct,
        deleteProduct,
        addDebt,
        deleteDebt,
        addExpense,
        updateExpense,
        deleteExpense,
        partialPayDebt,
        markDebtPaid,
        sendDebtReminder,
        updateSettings,
        voidTransaction,
        resetWorkspace,
        loadMoreTransactions,
        loadMoreDebts,
        loadMoreExpenses,
      }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error("useAppState harus dipakai di dalam AppStateProvider.");
  }

  return value;
}
