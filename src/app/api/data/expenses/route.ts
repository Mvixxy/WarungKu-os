import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { db } from "@/db/client";
import { expenses } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
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

    const where = eq(expenses.userId, userId);

    const [{ count: total }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(expenses)
      .where(where);

    const rows = await db
      .select()
      .from(expenses)
      .where(where)
      .orderBy(desc(expenses.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      expenses: rows.map((e) => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        createdAt: e.createdAt,
        category: e.category,
      })),
      pagination: { total, limit, offset },
    });
  } catch (error) {
    return handleRouteError(error, "Gagal memuat pengeluaran.");
  }
}
