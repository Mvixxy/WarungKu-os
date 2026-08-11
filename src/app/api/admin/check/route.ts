import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { getUserStatus } from "@/lib/server/admin";
import { handleRouteError } from "@/lib/server/route-error";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await getRequestUser();
    const status = await getUserStatus(userId);
    
    return NextResponse.json({ 
      approved: status?.approved ?? false, 
      isAdmin: status?.isAdmin ?? false,
      debug: { userId, status }
    });
  } catch (error) {
    return handleRouteError(error, "Gagal cek status.", 500);
  }
}
