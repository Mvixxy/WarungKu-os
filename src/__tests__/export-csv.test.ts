/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportTransactionsCSV, exportExpensesCSV } from "@/lib/export-csv";
import type { Transaction, Expense } from "@/lib/types";

// Mock DOM methods
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateElement = vi.fn(() => ({
  href: "",
  download: "",
  click: mockClick,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  });
  document.createElement = mockCreateElement;
  document.body.appendChild = mockAppendChild;
  document.body.removeChild = mockRemoveChild;
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
    {
      id: "tx_002",
      total: 15000,
      paymentMethod: "QRIS",
      voided: true,
      createdAt: "2026-08-12T11:00:00Z",
      items: [],
    },
  ];

  it("creates download link with correct filename", () => {
    exportTransactionsCSV(mockTransactions);
    expect(mockCreateElement).toHaveBeenCalledWith("a");
    const el = mockCreateElement.mock.results[0].value;
    expect(el.download).toMatch(/transaksi-.*\.csv/);
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

  it("creates download link with correct filename", () => {
    exportExpensesCSV(mockExpenses);
    expect(mockCreateElement).toHaveBeenCalledWith("a");
    const el = mockCreateElement.mock.results[0].value;
    expect(el.download).toMatch(/pengeluaran-.*\.csv/);
  });
});
