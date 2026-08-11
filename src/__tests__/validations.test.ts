import { describe, it, expect } from "vitest";
import {
  productDraftSchema,
  debtDraftSchema,
  expenseSchema,
} from "@/lib/validations";

describe("productDraftSchema", () => {
  const validProduct = {
    name: "Indomie Goreng",
    category: "Makanan" as const,
    buyPrice: 2500,
    sellPrice: 3500,
    stock: 50,
    minimumStock: 10,
    description: "Mi instan goreng",
    imageUrl: "",
  };

  it("accepts valid product", () => {
    const result = productDraftSchema.safeParse(validProduct);
    expect(result.success).true;
  });

  it("rejects empty name", () => {
    const result = productDraftSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).false;
  });

  it("rejects negative buyPrice", () => {
    const result = productDraftSchema.safeParse({ ...validProduct, buyPrice: -1 });
    expect(result.success).false;
  });

  it("rejects negative stock", () => {
    const result = productDraftSchema.safeParse({ ...validProduct, stock: -5 });
    expect(result.success).false;
  });

  it("accepts valid imageUrl", () => {
    const result = productDraftSchema.safeParse({ ...validProduct, imageUrl: "https://example.com/img.jpg" });
    expect(result.success).true;
  });

  it("accepts empty imageUrl", () => {
    const result = productDraftSchema.safeParse({ ...validProduct, imageUrl: "" });
    expect(result.success).true;
  });

  it("rejects invalid imageUrl", () => {
    const result = productDraftSchema.safeParse({ ...validProduct, imageUrl: "not-a-url" });
    expect(result.success).false;
  });
});

describe("debtDraftSchema", () => {
  const validDebt = {
    borrowerName: "Pak Budi",
    whatsapp: "6281234567890",
    amount: 50000,
    dueDate: "2026-08-20",
  };

  it("accepts valid debt", () => {
    const result = debtDraftSchema.safeParse(validDebt);
    expect(result.success).true;
  });

  it("rejects empty borrowerName", () => {
    const result = debtDraftSchema.safeParse({ ...validDebt, borrowerName: "" });
    expect(result.success).false;
  });

  it("rejects zero amount", () => {
    const result = debtDraftSchema.safeParse({ ...validDebt, amount: 0 });
    expect(result.success).false;
  });

  it("rejects negative amount", () => {
    const result = debtDraftSchema.safeParse({ ...validDebt, amount: -10000 });
    expect(result.success).false;
  });
});

describe("expenseSchema", () => {
  const validExpense = {
    title: "Listrik bulanan",
    amount: 250000,
    category: "Utilitas" as const,
  };

  it("accepts valid expense", () => {
    const result = expenseSchema.safeParse(validExpense);
    expect(result.success).true;
  });

  it("rejects empty title", () => {
    const result = expenseSchema.safeParse({ ...validExpense, title: "" });
    expect(result.success).false;
  });

  it("rejects zero amount", () => {
    const result = expenseSchema.safeParse({ ...validExpense, amount: 0 });
    expect(result.success).false;
  });
});
