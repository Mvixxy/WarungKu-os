# WarungKu OS

Aplikasi kasir tablet-first untuk operasional warung modern. Dibangun dengan Next.js 16, Tailwind CSS v4, shadcn/ui, Drizzle ORM, PostgreSQL, dan Better Auth.

**Live:** [warung-ku-os.vercel.app](https://warung-ku-os.vercel.app/)

## Fitur Utama

- **Kasir Cepat (POS)** — Tap produk, pilih metode bayar, selesai dalam hitungan detik. Stok otomatis terpotong.
- **Inventaris** — Kelola produk dengan harga beli/jual, stok, kategori, dan restok.
- **Buku Hutang (Kasbon)** — Catat kasbon pelanggan, bayar parsial, tandai lunas, kirim pengingat via WhatsApp.
- **Laporan Keuangan** — Laba/rugi harian, mingguan, bulanan dengan grafik. Cetak PDF via `window.print()`.
- **Pengeluaran** — Catat, edit, dan hapus pengeluaran warung.
- **Void Transaksi** — Batalkan transaksi dengan otomatis mengembalikan stok.
- **AI Assistant** — Asisten pintar berbasis LLM (OpenRouter) untuk analisis data bisnis.
- **PWA** — Install sebagai aplikasi di HP/tablet, mendukung offline caching.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (Neon cloud) |
| ORM | Drizzle ORM |
| Auth | Better Auth |
| Validation | Zod |
| Chart | Recharts |
| AI | OpenRouter API |
| Hosting | Vercel |

## Jalankan Lokal

```bash
npm install
cp .env.example .env    # isi DATABASE_URL, BETTER_AUTH_SECRET, dll
npm run dev
```

App terbuka di [http://localhost:3000](http://localhost:3000).

### Database

App menggunakan **PostgreSQL cloud (Neon)**. Untuk local dev, kamu bisa pakai Docker:

```bash
docker run -d --name warungku-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=warungku \
  -p 5439:5432 \
  postgres:16-alpine
```

Lalu set `DATABASE_URL=postgresql://postgres:postgres@localhost:5439/warungku` di `.env`.

Schema dan migrasi otomatis dijalankan saat app pertama kali diakses (via `schema_migrations` table).

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Secret key untuk auth session |
| `OPENROUTER_API_KEY` | No | API key untuk AI Assistant |

## Struktur Project

```
src/
├── app/
│   ├── (dashboard)/       # Halaman utama (kasir, produk, hutang, laporan, pengaturan)
│   ├── api/               # API routes (bootstrap, transactions, debts, expenses, products, AI)
│   ├── auth/              # Halaman login
│   └── layout.tsx         # Root layout
├── components/
│   ├── warung/            # View components (kasir, dashboard, laporan, buku-hutang, dll)
│   ├── providers/         # AppStateProvider, ThemeProvider
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── server/            # app-service, migrations, rate-limit, logger
│   ├── db/                # Drizzle client
│   └── types.ts           # TypeScript types
public/
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
└── icon-*.png             # PWA icons
```

## API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/bootstrap` | GET | Load semua data (produk, transaksi, hutang, pengeluaran) |
| `/api/bootstrap/reset` | POST | Reset workspace |
| `/api/transactions` | GET/POST | List & buat transaksi |
| `/api/transactions/[id]/void` | POST | Void transaksi |
| `/api/debts` | GET/POST | List & buat kasbon |
| `/api/debts/[id]` | PATCH | Update hutang |
| `/api/debts/[id]/partial` | POST | Bayar parsial |
| `/api/debts/[id]/remind` | POST | Tandai pengingat terkirim |
| `/api/expenses` | GET/POST | List & buat pengeluaran |
| `/api/expenses/[id]` | PATCH/DELETE | Edit & hapus pengeluaran |
| `/api/products` | GET/POST | List & buat produk |
| `/api/products/[id]` | PATCH/DELETE | Edit & hapus produk |
| `/api/settings` | GET/PATCH | Pengaturan warung |
| `/api/ai/chats` | GET/POST | AI Assistant chat |

## Production Features

- **Database Migration System** — Versioned migrations via `schema_migrations` table
- **Rate Limiting** — In-memory sliding window (60 req/menit, 10 untuk AI)
- **Error Boundary** — Global, dashboard, dan 404 error handling
- **Structured Logging** — JSON logging untuk observability di Vercel
- **PWA** — Service worker, offline caching, installable

## Verifikasi

```bash
npx tsc --noEmit    # Type check
npm run lint        # Lint check
npm run build       # Build check
```
