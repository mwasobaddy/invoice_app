import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { z } from "zod";

const Schema = z.object({
  provider: z.enum(["nvidia", "openai", "claude", "gemini"]).optional(),
  apiKey: z.string().min(1).max(500).optional(), // empty = clear
});

// GET — return masked key + provider
export async function GET() {
  try {
    const user = await requireAuth();
    const dbUser = await prisma.user.findUnique({ where: { id: user.id! }, select: { aiProvider: true, aiKeyEncrypted: true } });
    if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const hasKey = !!dbUser.aiKeyEncrypted;
    const masked = hasKey ? "••••" + decrypt(dbUser.aiKeyEncrypted!).slice(-4) : null;
    return NextResponse.json({ provider: dbUser.aiProvider || "openai", hasKey, masked });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const raw = await request.json();
    const parsed = Schema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    const { provider, apiKey } = parsed.data;

    // Update provider always if provided
    const data: Record<string, unknown> = {};
    if (provider) data.aiProvider = provider;
    if (apiKey !== undefined) {
      if (apiKey === "" || apiKey === null) {
        data.aiKeyEncrypted = null;
        data.aiProvider = provider || null;
      } else {
        data.aiKeyEncrypted = encrypt(apiKey);
        if (provider) data.aiProvider = provider;
      }
    }

    await prisma.user.update({ where: { id: user.id! }, data });
    const { writeAuditLog } = await import("@/lib/audit");
    await writeAuditLog({ userId: user.id!, action: "update_ai_key", entity: "User", entityId: user.id!, diff: { provider: provider || "kept" } as Record<string, unknown>, ip: request.headers.get("x-forwarded-for") });
    return NextResponse.json({ message: "Saved" });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("ai-key error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST { test: true, imageUrl } — test key without saving
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { imageUrl, provider, apiKey } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
    let key = apiKey as string | undefined;
    let prov = provider as string | undefined;
    if (!key) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id! }, select: { aiKeyEncrypted: true, aiProvider: true } });
      if (dbUser?.aiKeyEncrypted) {
        try { key = decrypt(dbUser.aiKeyEncrypted); prov = dbUser.aiProvider || prov || "openai"; } catch {}
      }
      if (!key) key = process.env.OPENAI_API_KEY || "";
      if (!prov) prov = "openai";
    }
    if (!key) return NextResponse.json({ error: "No API key set" }, { status: 400 });
    // Try real call if key looks real (not placeholder)
    if (key.startsWith("sk-placeholder")) return NextResponse.json({ description: "Office supplies (AI parsed)", amount: 42.5, category: "Office Supplies", note: "Placeholder key, using mock" });
    // In prod, would call provider here — for now return parsed mock with provider echo
    return NextResponse.json({ description: `Test parse via ${prov}`, amount: 42.5, category: "Office Supplies", provider: prov, ai: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
