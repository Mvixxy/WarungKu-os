import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { getUserStatus, promoteToAdmin } from "@/lib/server/admin";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 300, maxRequests: 5 });
    if (!rateLimit.allowed) return rateLimit.response!;

    const { userId } = await getRequestUser();
    const status = await getUserStatus(userId);
    if (!status?.isAdmin) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = (await request.json()) as { email: string };
    if (!body.email) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    const success = await promoteToAdmin(body.email);
    if (!success) {
      return NextResponse.json({ error: "User dengan email tersebut tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ message: `${body.email} berhasil dipromosikan ke admin.` });
  } catch (error) {
    return handleRouteError(error, "Gagal promosi admin.", 500);
  }
}
