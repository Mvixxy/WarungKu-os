import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { pool } from "@/db/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await getRequestUser();
    
    try {
      const result = await pool.query(
        'SELECT email_verified FROM "user" WHERE id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ verified: false });
      }
      const val = result.rows[0].email_verified;
      const verified = val === true || val === "t" || val === 1;
      return NextResponse.json({ verified });
    } catch {
      // Column may not exist yet
      return NextResponse.json({ verified: false });
    }
  } catch (error) {
    return handleRouteError(error, "Gagal cek verifikasi.", 500);
  }
}
