import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { db } from "@/db/client";
import { transactions, transactionItems } from "@/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getRequestUser();
    const { searchParams } = new URL(request.url);
    const { limit, offset } = querySchema.parse({
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    });

    const where = eq(transactions.userId, userId);

    const [{ count: total }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transactions)
      .where(where);

    const rows = await db
      .select()
      .from(transactions)
      .where(where)
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    const ids = rows.map((t) => t.id);
    const itemRows = ids.length > 0
      ? await db.select().from(transactionItems).where(inArray(transactionItems.transactionId, ids))
      : [];

    const itemsByTx = new Map<string, typeof itemRows>();
    for (const item of itemRows) {
      const arr = itemsByTx.get(item.transactionId) ?? [];
      arr.push(item);
      itemsByTx.set(item.transactionId, arr);
    }

    return NextResponse.json({
      transactions: rows.map((t) => ({
        id: t.id,
        paymentMethod: t.paymentMethod,
        total: t.total,
        voided: t.voided === 1,
        voidedAt: t.voidedAt ?? undefined,
        voidReason: t.voidReason ?? undefined,
        createdAt: t.createdAt,
        items: (itemsByTx.get(t.id) ?? []).map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          costPrice: i.costPrice,
        })),
      })),
      pagination: { total, limit, offset },
    });
  } catch (error) {
    return handleRouteError(error, "Gagal memuat transaksi.");
  }
}
