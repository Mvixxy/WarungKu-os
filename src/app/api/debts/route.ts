import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, createDebt } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { debtDraftSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getRequestUser();
    const body = await request.json();
    const draft = debtDraftSchema.parse(body);
    const debt = await createDebt(userId, draft);
    return NextResponse.json({ debt });
  } catch (error) {
    return handleRouteError(error, "Gagal menyimpan kasbon.");
  }
}
