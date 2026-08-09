import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, createProduct } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { productDraftSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getRequestUser();
    const body = await request.json();
    const draft = productDraftSchema.parse(body);
    const product = await createProduct(userId, draft);
    return NextResponse.json({ product });
  } catch (error) {
    return handleRouteError(error, "Gagal membuat produk.");
  }
}
