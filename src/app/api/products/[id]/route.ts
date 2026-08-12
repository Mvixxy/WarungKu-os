import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, updateProduct, deleteProduct } from "@/lib/server/app-service";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";
import { productDraftSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getRequestUser();
    const { id } = await params;
    const body = await request.json();
    const draft = productDraftSchema.parse(body);
    const product = await updateProduct(userId, id, draft);
    return NextResponse.json({ product });
  } catch (error) {
    return handleRouteError(error, "Gagal memperbarui produk.");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getRequestUser();
    const { id } = await params;
    await deleteProduct(userId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "Gagal menghapus produk.");
  }
}
