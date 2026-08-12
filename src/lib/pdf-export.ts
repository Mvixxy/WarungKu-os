import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Transaction, Expense } from "./types";
import { formatCurrency, formatDateTime } from "./format";

export function exportLaporanPDF(opts: {
  transactions: Transaction[];
  expenses: Expense[];
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  storeName: string;
  ownerName: string;
}) {
  const { transactions, expenses, period, totalRevenue, totalExpenses, netProfit, storeName, ownerName } = opts;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(storeName || "WarungKu", pageWidth / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Laporan Keuangan — ${period}`, pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, pageWidth / 2, y, { align: "center" });
  y += 10;

  // Summary box
  doc.setFillColor(245, 240, 235);
  doc.roundedRect(15, y, pageWidth - 30, 28, 3, 3, "F");
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan", 20, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Total Pendapatan:", 20, y);
  doc.text(formatCurrency(totalRevenue), 75, y);
  doc.text("Total Pengeluaran:", 120, y);
  doc.text(formatCurrency(totalExpenses), 175, y);
  y += 6;

  doc.text("Laba Bersih:", 20, y);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(netProfit), 75, y);
  y += 12;

  // Transactions table
  if (transactions.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Daftar Transaksi", 15, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["#", "Tanggal", "Total", "Metode", "Status"]],
      body: transactions.map((t, i) => [
        String(i + 1),
        formatDateTime(t.createdAt),
        formatCurrency(t.total),
        t.paymentMethod,
        t.voided ? "Dibatalkan" : "Sukses",
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [139, 94, 60] },
      columnStyles: {
        0: { cellWidth: 10 },
        2: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 15, right: 15 },
    });

    // @ts-expect-error jspdf-autotable types
    y = doc.lastAutoTable.finalY + 8;
  }

  // Expenses table
  if (expenses.length > 0) {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 15;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Daftar Pengeluaran", 15, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["#", "Tanggal", "Judul", "Kategori", "Jumlah"]],
      body: expenses.map((e, i) => [
        String(i + 1),
        formatDateTime(e.createdAt),
        e.title,
        e.category,
        formatCurrency(e.amount),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [139, 94, 60] },
      columnStyles: {
        0: { cellWidth: 10 },
        4: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 15, right: 15 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text(
      `${storeName} — ${ownerName} | Halaman ${i} dari ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  // Download
  const filename = `laporan-${period.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
