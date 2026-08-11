import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";
import { db } from "@/db/client";
import { products } from "@/db/schema";

export const runtime = "nodejs";

type ImportBody = {
  products: Array<{
    name: string;
    category: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    minimumStock: number;
    description?: string;
    imageUrl?: string;
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 60, maxRequests: 5 });
    if (!rateLimit.allowed) return rateLimit.response!;

    const { userId } = await getRequestUser();
    const body = (await request.json()) as ImportBody;

    if (!Array.isArray(body.products) || body.products.length === 0) {
      return NextResponse.json({ error: "Tidak ada produk untuk diimport." }, { status: 400 });
    }

    if (body.products.length > 200) {
      return NextResponse.json({ error: "Maksimal 200 produk per import." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const values = body.products.map((p) => ({
      id: `prod_${crypto.randomUUID().slice(0, 10)}`,
      userId,
      name: p.name.slice(0, 200),
      category: p.category,
      buyPrice: Math.max(0, Math.round(p.buyPrice)),
      sellPrice: Math.max(0, Math.round(p.sellPrice)),
      stock: Math.max(0, Math.round(p.stock)),
      minimumStock: Math.max(0, Math.round(p.minimumStock)),
      description: (p.description ?? "").slice(0, 500),
      imageUrl: (p.imageUrl ?? "").slice(0, 500),
      createdAt: now,
      updatedAt: now,
    }));

    // Batch insert in chunks of 50
    const chunkSize = 50;
    let inserted = 0;
    for (let i = 0; i < values.length; i += chunkSize) {
      const chunk = values.slice(i, i + chunkSize);
      await db.insert(products).values(chunk);
      inserted += chunk.length;
    }

    return NextResponse.json({
      message: `${inserted} produk berhasil diimport.`,
      imported: inserted,
    });
  } catch (error) {
    return handleRouteError(error, "Gagal mengimport produk.", 500);
  }
}
