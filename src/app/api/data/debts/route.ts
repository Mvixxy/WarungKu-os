import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, getBootstrapState } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getRequestUser();
    const { searchParams } = new URL(request.url);
    const { limit, offset } = querySchema.parse({
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    });

    const state = await getBootstrapState(userId, {
      debtLimit: limit,
      debtOffset: offset,
    });

    return NextResponse.json({
      debts: state.debts,
      pagination: state.pagination?.debts,
    });
  } catch (error) {
    return handleRouteError(error, "Gagal memuat hutang.");
  }
}
