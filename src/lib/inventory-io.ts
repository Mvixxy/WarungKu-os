import * as XLSX from "xlsx";
import { Product, ProductDraft } from "./types";

type ExportedProduct = {
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minimumStock: number;
  description: string;
  imageUrl: string;
};

export type ImportResult = {
  total: number;
  imported: number;
  errors: Array<{ row: number; message: string }>;
};

const VALID_CATEGORIES = ["Makanan", "Minuman", "Sembako", "Kebutuhan Harian"];
const XLSX_HEADERS = ["Nama", "Kategori", "Harga Beli", "Harga Jual", "Stok", "Stok Minimum", "Deskripsi", "URL Gambar"];

/**
 * Build export data array from products (shared between JSON and XLSX).
 */
function buildExportData(products: Product[]): ExportedProduct[] {
  return products.map((p) => ({
    name: p.name,
    category: p.category,
    buyPrice: p.buyPrice,
    sellPrice: p.sellPrice,
    stock: p.stock,
    minimumStock: p.minimumStock,
    description: p.description ?? "",
    imageUrl: p.imageUrl ?? "",
  }));
}

// ─── JSON EXPORT / IMPORT ───────────────────────────────────────────

/**
 * Export products to a JSON file (client-side download).
 * Strips server-side fields (id, userId, timestamps).
 */
export function exportProductsJSON(products: Product[]) {
  const data = buildExportData(products);

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    source: "WarungKu OS",
    productCount: data.length,
    products: data,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventaris-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate and parse an imported JSON file.
 * Returns ProductDraft[] ready for API, or errors.
 */
export function validateImportJSON(
  json: unknown
): { drafts: ProductDraft[]; errors: string[] } {
  const errors: string[] = [];
  const obj = json as Record<string, unknown>;

  if (!obj || typeof obj !== "object") {
    return { drafts: [], errors: ["File JSON tidak valid."] };
  }

  if (!Array.isArray(obj.products)) {
    return { drafts: [], errors: ["Format file tidak sesuai: 'products' array tidak ditemukan."] };
  }

  const drafts: ProductDraft[] = [];

  for (let i = 0; i < obj.products.length; i++) {
    const p = obj.products[i] as Record<string, unknown>;
    const row = i + 1;

    if (!p.name || typeof p.name !== "string" || p.name.trim().length === 0) {
      errors.push(`Baris ${row}: Nama produk kosong.`);
      continue;
    }
    if (!p.category || !VALID_CATEGORIES.includes(String(p.category))) {
      errors.push(`Baris ${row} (${p.name}): Kategori "${String(p.category)}" tidak valid.`);
      continue;
    }
    if (typeof p.buyPrice !== "number" || p.buyPrice < 0) {
      errors.push(`Baris ${row} (${p.name}): Harga beli tidak valid.`);
      continue;
    }
    if (typeof p.sellPrice !== "number" || p.sellPrice < 0) {
      errors.push(`Baris ${row} (${p.name}): Harga jual tidak valid.`);
      continue;
    }
    if (typeof p.stock !== "number" || p.stock < 0) {
      errors.push(`Baris ${row} (${p.name}): Stok tidak valid.`);
      continue;
    }
    if (typeof p.minimumStock !== "number" || p.minimumStock < 0) {
      errors.push(`Baris ${row} (${p.name}): Stok minimum tidak valid.`);
      continue;
    }

    drafts.push({
      name: String(p.name).trim(),
      category: String(p.category),
      buyPrice: Math.round(p.buyPrice),
      sellPrice: Math.round(p.sellPrice),
      stock: Math.round(p.stock),
      minimumStock: Math.round(p.minimumStock),
      description: typeof p.description === "string" ? p.description : "",
      imageUrl: typeof p.imageUrl === "string" ? p.imageUrl : "",
    });
  }

  return { drafts, errors };
}

// ─── XLSX EXPORT / IMPORT ───────────────────────────────────────────

/**
 * Export products to an XLSX file (client-side download).
 * Columns: Nama, Kategori, Harga Beli, Harga Jual, Stok, Stok Minimum, Deskripsi, URL Gambar
 */
export function exportProductsXLSX(products: Product[]) {
  const data = buildExportData(products);

  const rows = data.map((p) => ({
    "Nama": p.name,
    "Kategori": p.category,
    "Harga Beli": p.buyPrice,
    "Harga Jual": p.sellPrice,
    "Stok": p.stock,
    "Stok Minimum": p.minimumStock,
    "Deskripsi": p.description,
    "URL Gambar": p.imageUrl,
  }));

  const ws = XLSX.utils.json_to_sheet(rows, { header: XLSX_HEADERS });

  // Column widths
  ws["!cols"] = [
    { wch: 30 }, // Nama
    { wch: 16 }, // Kategori
    { wch: 14 }, // Harga Beli
    { wch: 14 }, // Harga Jual
    { wch: 8 },  // Stok
    { wch: 14 }, // Stok Minimum
    { wch: 40 }, // Deskripsi
    { wch: 30 }, // URL Gambar
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventaris");

  // Add a README sheet with metadata
  const readmeData = [
    { "Field": "Diekspor dari", "Nilai": "WarungKu OS" },
    { "Field": "Tanggal export", "Nilai": new Date().toLocaleDateString("id-ID") },
    { "Field": "Jumlah produk", "Nilai": products.length },
    { "Field": "", "Nilai": "" },
    { "Field": "Petunjuk import", "Nilai": "Isi sheet 'Inventaris' sesuai kolom yang ada. Jangan ubah nama kolom." },
    { "Field": "Kategori valid", "Nilai": "Makanan, Minuman, Sembako, Kebutuhan Harian" },
  ];
  const readmeWs = XLSX.utils.json_to_sheet(readmeData, { header: ["Field", "Nilai"] });
  readmeWs["!cols"] = [{ wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, readmeWs, "Petunjuk");

  XLSX.writeFile(wb, `inventaris-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Validate and parse an imported XLSX file.
 * Reads the first sheet (or sheet named "Inventaris") and maps columns to ProductDraft[].
 */
export function validateImportXLSX(
  workbook: XLSX.WorkBook
): { drafts: ProductDraft[]; errors: string[] } {
  const errors: string[] = [];

  // Try to find "Inventaris" sheet, fallback to first sheet
  const sheetName = workbook.SheetNames.includes("Inventaris")
    ? "Inventaris"
    : workbook.SheetNames[0];

  if (!sheetName) {
    return { drafts: [], errors: ["File XLSX tidak memiliki sheet."] };
  }

  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  if (raw.length === 0) {
    return { drafts: [], errors: ["Sheet kosong, tidak ada data produk."] };
  }

  // Map Indonesian headers to field names
  const headerMap: Record<string, keyof ExportedProduct> = {
    "Nama": "name",
    "Kategori": "category",
    "Harga Beli": "buyPrice",
    "Harga Jual": "sellPrice",
    "Stok": "stock",
    "Stok Minimum": "minimumStock",
    "Deskripsi": "description",
    "URL Gambar": "imageUrl",
  };

  // Detect column mapping from first row's keys
  const firstRow = raw[0];
  const keys = Object.keys(firstRow);
  const mapping: Record<string, string> = {};

  for (const key of keys) {
    const normalized = key.trim();
    if (headerMap[normalized]) {
      mapping[normalized] = headerMap[normalized];
    }
  }

  // If no Indonesian headers found, try English fallback
  if (Object.keys(mapping).length === 0) {
    const englishMap: Record<string, keyof ExportedProduct> = {
      "name": "name",
      "Name": "name",
      "category": "category",
      "Category": "category",
      "buyPrice": "buyPrice",
      "Buy Price": "buyPrice",
      "sellPrice": "sellPrice",
      "Sell Price": "sellPrice",
      "stock": "stock",
      "Stock": "stock",
      "minimumStock": "minimumStock",
      "Minimum Stock": "minimumStock",
      "description": "description",
      "Description": "description",
      "imageUrl": "imageUrl",
      "Image URL": "imageUrl",
    };
    for (const key of keys) {
      const normalized = key.trim();
      if (englishMap[normalized]) {
        mapping[normalized] = englishMap[normalized];
      }
    }
  }

  const drafts: ProductDraft[] = [];

  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    const rowNum = i + 1;

    // Build a normalized object
    const p: Record<string, unknown> = {};
    for (const [header, field] of Object.entries(mapping)) {
      p[field] = row[header];
    }

    if (!p.name || String(p.name).trim().length === 0) {
      errors.push(`Baris ${rowNum}: Nama produk kosong.`);
      continue;
    }

    const cat = String(p.category ?? "").trim();
    if (!cat || !VALID_CATEGORIES.includes(cat)) {
      errors.push(`Baris ${rowNum} (${p.name}): Kategori "${cat}" tidak valid.`);
      continue;
    }

    const buyPrice = Number(p.buyPrice);
    if (isNaN(buyPrice) || buyPrice < 0) {
      errors.push(`Baris ${rowNum} (${p.name}): Harga beli tidak valid.`);
      continue;
    }

    const sellPrice = Number(p.sellPrice);
    if (isNaN(sellPrice) || sellPrice < 0) {
      errors.push(`Baris ${rowNum} (${p.name}): Harga jual tidak valid.`);
      continue;
    }

    const stock = Number(p.stock);
    if (isNaN(stock) || stock < 0) {
      errors.push(`Baris ${rowNum} (${p.name}): Stok tidak valid.`);
      continue;
    }

    const minimumStock = Number(p.minimumStock);
    if (isNaN(minimumStock) || minimumStock < 0) {
      errors.push(`Baris ${rowNum} (${p.name}): Stok minimum tidak valid.`);
      continue;
    }

    drafts.push({
      name: String(p.name).trim(),
      category: cat,
      buyPrice: Math.round(buyPrice),
      sellPrice: Math.round(sellPrice),
      stock: Math.round(stock),
      minimumStock: Math.round(minimumStock),
      description: typeof p.description === "string" ? p.description : "",
      imageUrl: typeof p.imageUrl === "string" ? p.imageUrl : "",
    });
  }

  return { drafts, errors };
}
