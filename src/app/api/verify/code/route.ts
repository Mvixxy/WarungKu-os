import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";
import { pool } from "@/db/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 300, maxRequests: 10 });
    if (!rateLimit.allowed) return rateLimit.response!;

    const { userId } = await getRequestUser();
    const body = (await request.json()) as { code: string };

    if (!body.code || body.code.length !== 6) {
      return NextResponse.json({ error: "Kode harus 6 digit." }, { status: 400 });
    }

    // Get user email
    const userResult = await pool.query(
      'SELECT email FROM "user" WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    const email = userResult.rows[0].email;

    // Find valid code
    const codeResult = await pool.query(
      `SELECT id FROM email_verifications 
       WHERE email = $1 AND code = $2 AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, body.code]
    );

    if (codeResult.rows.length === 0) {
      return NextResponse.json({ error: "Kode tidak valid atau sudah kedaluwarsa." }, { status: 400 });
    }

    // Mark code as used
    await pool.query(
      'UPDATE email_verifications SET used = 1 WHERE id = $1',
      [codeResult.rows[0].id]
    );

    // Mark email as verified
    await pool.query(
      'UPDATE "user" SET email_verified = true WHERE id = $1',
      [userId]
    );

    return NextResponse.json({ message: "Email berhasil diverifikasi!" });
  } catch (error) {
    return handleRouteError(error, "Gagal verifikasi kode.", 500);
  }
}
