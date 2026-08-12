import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, voidTransaction } from "@/lib/server/app-service";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";
import { z } from "zod";

export const runtime = "nodejs";

const voidSchema = z.object({
  reason: z.string().max(200).default(""),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getRequestUser();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = voidSchema.parse(body);
    const transaction = await voidTransaction(userId, id, reason);
    return NextResponse.json({ transaction });
  } catch (error) {
    return handleRouteError(error, "Gagal membatalkan transaksi.");
  }
}
