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

/**
 * Export products to a JSON file (client-side download).
 * Strips server-side fields (id, userId, timestamps).
 */
export function exportProductsJSON(products: Product[]) {
  const data: ExportedProduct[] = products.map((p) => ({
    name: p.name,
    category: p.category,
    buyPrice: p.buyPrice,
    sellPrice: p.sellPrice,
    stock: p.stock,
    minimumStock: p.minimumStock,
    description: p.description ?? "",
    imageUrl: p.imageUrl ?? "",
  }));

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

  const validCategories = ["Makanan", "Minuman", "Sembako", "Kebutuhan Harian"];
  const drafts: ProductDraft[] = [];

  for (let i = 0; i < obj.products.length; i++) {
    const p = obj.products[i] as Record<string, unknown>;
    const row = i + 1;

    if (!p.name || typeof p.name !== "string" || p.name.trim().length === 0) {
      errors.push(`Baris ${row}: Nama produk kosong.`);
      continue;
    }
    if (!p.category || !validCategories.includes(String(p.category))) {
      errors.push(`Baris ${row} (${p.name}): Kategori "${p.category}" tidak valid.`);
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
