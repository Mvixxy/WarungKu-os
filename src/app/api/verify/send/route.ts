import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { sendVerificationCode } from "@/lib/server/email";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";
import { pool } from "@/db/client";

export const runtime = "nodejs";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 300, maxRequests: 5 });
    if (!rateLimit.allowed) return rateLimit.response!;

    const { userId } = await getRequestUser();

    // Get user email and name
    const userResult = await pool.query(
      'SELECT email, name, email_verified FROM "user" WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    const user = userResult.rows[0];
    if (user.email_verified === true || user.email_verified === "t") {
      return NextResponse.json({ message: "Email sudah terverifikasi." });
    }

    // Rate limit: max 3 codes per email per 10 minutes
    const recentCodes = await pool.query(
      `SELECT COUNT(*) as count FROM email_verifications 
       WHERE email = $1 AND created_at > NOW() - INTERVAL '10 minutes'`,
      [user.email]
    );
    if (Number(recentCodes.rows[0].count) >= 3) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Tunggu 10 menit." }, { status: 429 });
    }

    // Invalidate old codes
    await pool.query(
      'UPDATE email_verifications SET used = 1 WHERE email = $1 AND used = 0',
      [user.email]
    );

    // Generate and store new code
    const code = generateCode();
    const id = `ev_${crypto.randomUUID().slice(0, 10)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await pool.query(
      'INSERT INTO email_verifications (id, email, code, expires_at) VALUES ($1, $2, $3, $4)',
      [id, user.email, code, expiresAt]
    );

    // Send email
    const sent = await sendVerificationCode(user.email, code, user.name || "User");
    if (!sent) {
      return NextResponse.json({ error: "Gagal mengirim email. Coba lagi." }, { status: 500 });
    }

    return NextResponse.json({ message: "Kode verifikasi dikirim ke email." });
  } catch (error) {
    return handleRouteError(error, "Gagal mengirim kode verifikasi.", 500);
  }
}
