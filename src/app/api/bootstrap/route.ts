import { NextRequest, NextResponse } from "next/server";
import { getBootstrapState, getRequestUser } from "@/lib/server/app-service";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request);
    if (!rateLimit.allowed) return rateLimit.response!;
    const { userId } = await getRequestUser();
    const appState = await getBootstrapState(userId);
    return NextResponse.json({ appState });
  } catch (error) {
    return handleRouteError(error, "Gagal memuat data aplikasi.", 500);
  }
}
