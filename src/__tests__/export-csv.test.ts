/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportTransactionsCSV, exportExpensesCSV } from "@/lib/export-csv";
import type { Transaction, Expense } from "@/lib/types";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("exportTransactionsCSV", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "tx_001",
      total: 35000,
      paymentMethod: "Tunai",
      voided: false,
      createdAt: "2026-08-12T10:30:00Z",
      items: [
        { productId: "p1", productName: "Indomie", quantity: 2, unitPrice: 3500, costPrice: 2500 },
      ],
    },
  ];

  it("does not throw when called", () => {
    expect(() => exportTransactionsCSV(mockTransactions)).not.toThrow();
  });
});

describe("exportExpensesCSV", () => {
  const mockExpenses: Expense[] = [
    {
      id: "exp_001",
      title: "Listrik",
      amount: 250000,
      category: "Utilitas",
      createdAt: "2026-08-12T08:00:00Z",
    },
  ];

  it("does not throw when called", () => {
    expect(() => exportExpensesCSV(mockExpenses)).not.toThrow();
  });
});
