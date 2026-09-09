import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

export async function withAuth<T>(handler: (user: { id: string; email?: string | null }) => Promise<T>) {
  try {
    const user = await requireAuth();
    if (!user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return await handler(user as { id: string; email?: string | null });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function serverError(message = "Internal server error", error?: unknown) {
  // In prod, don't leak stack — log to console (replace with Sentry)
  if (error) console.error(message, error);
  return NextResponse.json({ error: message }, { status: 500 });
}
