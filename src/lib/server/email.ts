import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD?.replace(/\s/g, ""),
  },
});

/**
 * Send a verification code to the user's email.
 * Returns true if sent successfully.
 */
export async function sendVerificationCode(
  email: string,
  code: string,
  name: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"WarungKu OS" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Kode Verifikasi WarungKu: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="background: #8B5E3C; color: white; padding: 16px 24px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">WarungKu OS</h1>
          </div>
          <div style="background: #FAF5F0; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5d5c5;">
            <p style="margin: 0 0 8px; color: #333;">Halo <strong>${name}</strong>,</p>
            <p style="margin: 0 0 16px; color: #555;">Berikut kode verifikasi akun WarungKu Anda:</p>
            <div style="background: white; border: 2px dashed #8B5E3C; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8B5E3C; font-family: monospace;">${code}</span>
            </div>
            <p style="margin: 0 0 8px; color: #888; font-size: 12px;">Kode ini berlaku selama <strong>10 menit</strong>.</p>
            <p style="margin: 0; color: #888; font-size: 12px;">Jika Anda tidak mendaftar di WarungKu, abaikan email ini.</p>
          </div>
          <p style="text-align: center; color: #aaa; font-size: 11px; margin-top: 16px;">WarungKu OS — Aplikasi Kasir Warung Modern</p>
        </div>
      `,
    });

    logger.info("Verification code sent", { email });
    return true;
  } catch (err) {
    logger.error("Failed to send verification email", { email, error: String(err) });
    return false;
  }
}
