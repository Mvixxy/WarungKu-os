import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { getUserStatus } from "@/lib/server/admin";
import { handleRouteError } from "@/lib/server/route-error";

export const runtime = "nodejs";

/**
 * Check if the current user is approved and/or admin.
 * Used by the client to decide whether to redirect to /pending.
 */
export async function GET() {
  try {
    const { userId } = await getRequestUser();
    const status = await getUserStatus(userId);
    if (!status) {
      return NextResponse.json({ approved: false, isAdmin: false });
    }
    return NextResponse.json({ approved: status.approved, isAdmin: status.isAdmin });
  } catch (error) {
    return handleRouteError(error, "Gagal cek status.", 500);
  }
}
