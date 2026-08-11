import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { getUserStatus, approveUser, unapproveUser } from "@/lib/server/admin";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 60, maxRequests: 30 });
    if (!rateLimit.allowed) return rateLimit.response!;

    const { userId } = await getRequestUser();
    const status = await getUserStatus(userId);
    if (!status?.isAdmin) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = (await request.json()) as { targetUserId: string; approved: boolean };
    if (!body.targetUserId) {
      return NextResponse.json({ error: "targetUserId wajib diisi." }, { status: 400 });
    }

    const success = body.approved
      ? await approveUser(body.targetUserId)
      : await unapproveUser(body.targetUserId);

    if (!success) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      message: body.approved ? "User disetujui." : "User dibatalkan persetujuannya.",
    });
  } catch (error) {
    return handleRouteError(error, "Gagal update status user.", 500);
  }
}
