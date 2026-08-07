import { NextResponse } from "next/server";
import { createExpense, getRequestUser } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { userId } = await getRequestUser();
    const body = await request.json();
    const { title, amount, category } = body ?? {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Judul wajib diisi." }, { status: 400 });
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Nominal tidak valid." }, { status: 400 });
    }
    if (!category || !["Operasional", "Belanja", "Utilitas"].includes(category)) {
      return NextResponse.json({ error: "Kategori tidak valid." }, { status: 400 });
    }

    const expense = await createExpense(userId, {
      title: title.trim(),
      amount,
      category,
    });
    return NextResponse.json(expense);
  } catch (error) {
    return handleRouteError(error, "Gagal mencatat pengeluaran.");
  }
}
