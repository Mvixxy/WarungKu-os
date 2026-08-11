import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { getUserStatus, deleteUser } from "@/lib/server/admin";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 60, maxRequests: 10 });
    if (!rateLimit.allowed) return rateLimit.response!;

    const { userId } = await getRequestUser();
    const status = await getUserStatus(userId);
    if (!status?.isAdmin) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = (await request.json()) as { targetUserId: string };
    if (!body.targetUserId) {
      return NextResponse.json({ error: "targetUserId wajib diisi." }, { status: 400 });
    }

    if (body.targetUserId === userId) {
      return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri." }, { status: 400 });
    }

    const success = await deleteUser(body.targetUserId);
    if (!success) {
      return NextResponse.json({ error: "Gagal menghapus user." }, { status: 500 });
    }

    return NextResponse.json({ message: "User berhasil dihapus." });
  } catch (error) {
    console.error("[Admin Delete]", error);
    return NextResponse.json({ error: "Gagal menghapus user: " + String(error) }, { status: 500 });
  }
}
