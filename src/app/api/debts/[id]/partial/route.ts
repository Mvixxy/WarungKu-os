import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, partialPayDebt } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { z } from "zod";

export const runtime = "nodejs";

const partialPaySchema = z.object({
  amount: z.number().int().min(1, "Nominal bayar harus lebih dari 0."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getRequestUser();
    const { id } = await params;
    const body = await request.json();
    const { amount } = partialPaySchema.parse(body);
    const debt = await partialPayDebt(userId, id, amount);
    return NextResponse.json({ debt });
  } catch (error) {
    return handleRouteError(error, "Gagal mencatat pembayaran.");
  }
}
