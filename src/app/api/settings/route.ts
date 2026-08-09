import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, updateStoreSettings } from "@/lib/server/app-service";
import { handleRouteError } from "@/lib/server/route-error";
import { settingsSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await getRequestUser();
    const body = await request.json();
    const settings = settingsSchema.parse(body);
    const nextSettings = await updateStoreSettings(userId, settings);
    return NextResponse.json({ settings: nextSettings });
  } catch (error) {
    return handleRouteError(error, "Gagal menyimpan pengaturan.");
  }
}
