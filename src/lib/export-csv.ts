import { Transaction, Expense, Debt } from "./types";
import { formatDate } from "./format";

export function exportTransactionsCSV(transactions: Transaction[]) {
  const headers = ["Tanggal", "Total", "Metode Bayar", "Status", "Item"];
  const rows = transactions.map((t) => [
    formatDate(t.createdAt),
    String(t.total),
    t.paymentMethod,
    t.voided ? "Dibatalkan" : "Sukses",
    t.items?.map((i) => `${i.productName} x${i.quantity}`).join("; ") ?? "",
  ]);
  downloadCSV(headers, rows, `transaksi-${todayStr()}.csv`);
}

export function exportExpensesCSV(expenses: Expense[]) {
  const headers = ["Tanggal", "Judul", "Kategori", "Jumlah"];
  const rows = expenses.map((e) => [
    formatDate(e.createdAt),
    e.title,
    e.category,
    String(e.amount),
  ]);
  downloadCSV(headers, rows, `pengeluaran-${todayStr()}.csv`);
}

export function exportDebtsCSV(debts: Debt[]) {
  const headers = ["Nama", "WhatsApp", "Nominal", "Dibayar", "Status", "Jatuh Tempo", "Dicatat"];
  const rows = debts.map((d) => [
    d.borrowerName,
    d.whatsapp,
    String(d.amount),
    String(d.paidAmount ?? 0),
    d.isPaid ? "Lunas" : "Belum lunas",
    formatDate(d.dueDate),
    formatDate(d.createdAt),
  ]);
  downloadCSV(headers, rows, `hutang-${todayStr()}.csv`);
}

function downloadCSV(headers: string[], rows: string[][], filename: string) {
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const BOM = "﻿";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
