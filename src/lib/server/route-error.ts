import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { checkRateLimit, getClientIp, RateLimitConfig } from "@/lib/server/rate-limit";
import { logger } from "@/lib/server/logger";

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowSeconds: 60,
  maxRequests: 60,
};

export function handleRouteError(error: unknown, fallbackMessage: string, badRequestStatus = 400) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Data yang dikirim tidak valid.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  logger.error("API error", { message: error instanceof Error ? error.message : fallbackMessage, status: badRequestStatus });
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallbackMessage },
    { status: badRequestStatus }
  );
}

export function checkApiRateLimit(
  request: Request,
  config?: Partial<RateLimitConfig>
): { allowed: boolean; response?: NextResponse } {
  const ip = getClientIp(request);
  const path = new URL(request.url).pathname;
  const key = `${ip}:${path}`;
  const result = checkRateLimit(key, { ...DEFAULT_RATE_LIMIT, ...config });

  if (!result.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi sebentar." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      ),
    };
  }

  return { allowed: true };
}
