import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, createTransaction } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { transactionSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getRequestUser();
    const body = await request.json();
    const payload = transactionSchema.parse(body);
    const result = await createTransaction(userId, payload);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error, "Gagal membuat transaksi.");
  }
}
