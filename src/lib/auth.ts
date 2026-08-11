import { betterAuth } from "better-auth";
import { Pool } from "pg";

const globalForAuth = globalThis as typeof globalThis & {
  __warungosAuthPool?: Pool;
};

function toOrigin(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return new URL(value).origin;
  }

  return `https://${value}`;
}

function getTrustedAuthOrigins(request?: Request) {
  const origins = new Set<string>();

  for (const value of [
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
  ]) {
    if (!value) {
      continue;
    }

    origins.add(toOrigin(value));
  }

  if (request) {
    origins.add(new URL(request.url).origin);
  }

  if (origins.size === 0) {
    origins.add("http://localhost:3000");
  }

  return Array.from(origins);
}

function resolveAuthBaseUrl() {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_BRANCH_URL ??
    process.env.VERCEL_URL;

  if (vercelHost) {
    // Vercel exposes hostnames without a protocol.
    return `https://${vercelHost}`;
  }

  return "http://localhost:3000";
}

function getAuthPool() {
  if (!globalForAuth.__warungosAuthPool) {
    globalForAuth.__warungosAuthPool = new Pool({
      connectionString: process.env.DATABASE_URL ?? (() => {
    throw new Error("DATABASE_URL env var is required. Set it in your .env or Vercel environment variables.");
  })(),
    });
  }

  return globalForAuth.__warungosAuthPool;
}

export const auth = betterAuth({
  database: getAuthPool(),
  secret: process.env.BETTER_AUTH_SECRET ?? (() => {
    throw new Error("BETTER_AUTH_SECRET env var is required. Set it in your .env or Vercel environment variables.");
  })(),
  baseURL: resolveAuthBaseUrl(),
  trustedOrigins: async (request) => getTrustedAuthOrigins(request),
  emailAndPassword: {
    enabled: true,
  },

});
