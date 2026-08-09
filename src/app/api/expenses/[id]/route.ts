import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, updateExpense, deleteExpense } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { expenseSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getRequestUser();
    const { id } = await params;
    const body = await request.json();
    const data = expenseSchema.parse(body);
    const expense = await updateExpense(userId, id, data);
    return NextResponse.json({ expense });
  } catch (error) {
    return handleRouteError(error, "Gagal memperbarui pengeluaran.");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getRequestUser();
    const { id } = await params;
    await deleteExpense(userId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "Gagal menghapus pengeluaran.");
  }
}
