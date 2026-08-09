import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleRouteError(error: unknown, fallbackMessage: string, badRequestStatus = 400) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Zod validation errors — return first issue message
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Data yang dikirim tidak valid.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallbackMessage },
    { status: badRequestStatus }
  );
}
