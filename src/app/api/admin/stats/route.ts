import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { getUserStatus, getSystemStats } from "@/lib/server/admin";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 60, maxRequests: 30 });
    if (!rateLimit.allowed) return rateLimit.response!;

    const { userId } = await getRequestUser();
    const status = await getUserStatus(userId);
    
    if (!status?.isAdmin) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const stats = await getSystemStats();
    return NextResponse.json({ stats });
  } catch (error) {
    return handleRouteError(error, "Gagal memuat statistik.", 500);
  }
}
