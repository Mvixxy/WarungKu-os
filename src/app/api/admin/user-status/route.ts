import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { getUserStatus } from "@/lib/server/admin";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";
import { pool } from "@/db/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 60, maxRequests: 30 });
    if (!rateLimit.allowed) return rateLimit.response!;

    const { userId } = await getRequestUser();
    const status = await getUserStatus(userId);
    if (!status?.isAdmin) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const targetUserId = request.nextUrl.searchParams.get("userId");
    if (!targetUserId) {
      return NextResponse.json({ error: "userId wajib." }, { status: 400 });
    }

    // Check if user has an active (non-expired) session
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM session WHERE "userId" = $1 AND expiresAt > NOW()`,
      [targetUserId]
    );

    const online = Number(result.rows[0].count) > 0;
    return NextResponse.json({ online });
  } catch (error) {
    return handleRouteError(error, "Gagal cek status user.", 500);
  }
}
