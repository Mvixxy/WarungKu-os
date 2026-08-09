import { z } from "zod";

export const productDraftSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi.").max(200),
  category: z.string().min(1, "Kategori wajib diisi."),
  buyPrice: z.number().int().min(0, "Harga beli tidak boleh negatif."),
  sellPrice: z.number().int().min(0, "Harga jual tidak boleh negatif."),
  stock: z.number().int().min(0, "Stok tidak boleh negatif."),
  minimumStock: z.number().int().min(0, "Stok minimum tidak boleh negatif."),
  description: z.string().max(500).default(""),
});

export const transactionSchema = z.object({
  paymentMethod: z.enum(["Tunai", "QRIS", "Hutang"]),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1, "Jumlah harus minimal 1."),
  })).min(1, "Keranjang tidak boleh kosong."),
});

export const debtDraftSchema = z.object({
  borrowerName: z.string().min(1, "Nama peminjam wajib diisi.").max(100),
  whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit.").max(20),
  amount: z.number().int().min(1, "Nominal hutang harus lebih dari 0."),
  dueDate: z.string().min(1, "Tanggal jatuh tempo wajib diisi."),
});

export const expenseSchema = z.object({
  title: z.string().min(1, "Judul pengeluaran wajib diisi.").max(200),
  amount: z.number().int().min(1, "Nominal harus lebih dari 0."),
  category: z.enum(["Operasional", "Belanja", "Utilitas"]),
});

export const settingsSchema = z.object({
  storeName: z.string().min(1, "Nama warung wajib diisi.").max(100),
  storeTagline: z.string().max(200).default(""),
  storeAddress: z.string().min(1, "Alamat wajib diisi.").max(500),
  ownerName: z.string().min(1, "Nama pemilik wajib diisi.").max(100),
  ownerWhatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit.").max(20),
  city: z.string().min(1, "Kota wajib diisi.").max(100),
  businessNotes: z.string().max(1000).default(""),
  stockAlertThreshold: z.number().int().min(1, "Batas alert minimal 1."),
  enabledPayments: z.array(z.enum(["Tunai", "QRIS", "Hutang"])).min(1, "Minimal satu metode bayar aktif."),
  categories: z.array(z.string().min(1).max(50)).default(["Sembako"]),
});

export const restockSchema = z.object({
  quantity: z.number().int().min(1, "Jumlah restock harus minimal 1."),
});
