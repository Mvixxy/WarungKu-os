import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, resetWorkspace } from "@/lib/server/app-service";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request);
    if (!rateLimit.allowed) return rateLimit.response!;
    const { userId } = await getRequestUser();
    const appState = await resetWorkspace(userId);
    return NextResponse.json({ appState });
  } catch (error) {
    return handleRouteError(error, "Gagal mereset workspace.", 500);
  }
}
