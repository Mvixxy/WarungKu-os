import { NextRequest, NextResponse } from "next/server";
import { deleteDebt, getRequestUser, markDebtPaid } from "@/lib/server/app-service";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getRequestUser();
    const { id } = await context.params;
    const body = (await request.json()) as { isPaid?: boolean };

    if (body.isPaid !== true) {
      return NextResponse.json(
        { error: "Hanya perubahan status lunas yang didukung." },
        { status: 400 }
      );
    }

    const debt = await markDebtPaid(userId, id);
    return NextResponse.json({ debt });
  } catch (error) {
    return handleRouteError(error, "Gagal memperbarui status hutang.");
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getRequestUser();
    const { id } = await context.params;
    const result = await deleteDebt(userId, id);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error, "Gagal menghapus kasbon.");
  }
}
