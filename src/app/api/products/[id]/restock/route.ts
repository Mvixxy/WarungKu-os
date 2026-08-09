import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, restockProduct } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { restockSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getRequestUser();
    const { id } = await params;
    const body = await request.json();
    const { quantity } = restockSchema.parse(body);
    const product = await restockProduct(userId, id, quantity);
    return NextResponse.json({ product });
  } catch (error) {
    return handleRouteError(error, "Gagal restock produk.");
  }
}
