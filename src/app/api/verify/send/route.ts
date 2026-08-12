import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/server/app-service";
import { sendVerificationCode } from "@/lib/server/email";
import { handleRouteError, checkApiRateLimit } from "@/lib/server/route-error";
import { pool } from "@/db/client";
import { randomInt } from "crypto";

export const runtime = "nodejs";

function generateCode(): string {
  return randomInt(100000, 999999).toString();
}

export async function POST(request: Request) {
  try {
    const rateLimit = checkApiRateLimit(request, { windowSeconds: 300, maxRequests: 5 });
    if (!rateLimit.allowed) return rateLimit.response!;

    const { userId } = await getRequestUser();

    // Ensure email_verifications table exists (idempotent)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id text PRIMARY KEY,
        email text NOT NULL,
        code text NOT NULL,
        expires_at timestamptz NOT NULL,
        used integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS email_verifications_email_idx
        ON email_verifications(email, created_at DESC);
    `).catch(() => {});

    // Ensure email_verified column exists
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE "user" ADD COLUMN email_verified boolean DEFAULT false;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);

    // Get user email and name
    const userResult = await pool.query(
      'SELECT email, name, email_verified FROM "user" WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    const user = userResult.rows[0];
    const emailVerified = user.email_verified === true || user.email_verified === "t";
    if (emailVerified) {
      return NextResponse.json({ message: "Email sudah terverifikasi." });
    }

    // DEDUP: If there's already a valid unused code sent less than 2 minutes ago, don't send another
    const existingCode = await pool.query(
      `SELECT id FROM email_verifications 
       WHERE email = $1 AND used = 0 AND expires_at > NOW() 
         AND created_at > NOW() - INTERVAL '2 minutes'
       LIMIT 1`,
      [user.email]
    );
    if (existingCode.rows.length > 0) {
      return NextResponse.json({ message: "Kode sudah dikirim. Cek email kamu." });
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

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
