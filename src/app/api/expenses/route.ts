import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, createExpense } from "@/lib/server/app-service";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";
import { expenseSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 60, maxRequests: 30 });
    if (!rateLimit.allowed) return rateLimit.response!;
    const { userId } = await getRequestUser();
    const body = await request.json();
    const data = expenseSchema.parse(body);
    const expense = await createExpense(userId, data);
    return NextResponse.json(expense);
  } catch (error) {
    return handleRouteError(error, "Gagal mencatat pengeluaran.");
  }
}
