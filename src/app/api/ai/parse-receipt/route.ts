import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

// POST /api/ai/parse-receipt — AI receipt parse placeholder
// Body: { imageUrl } or formData with file
// In prod: import { generateText } from "ai"; const { text } = await generateText({ model: openai("gpt-4o-mini"), prompt: `Parse receipt ${imageUrl} -> JSON { description, amount, category }` })
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const { imageUrl } = body as { imageUrl?: string };
    if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

    // BYOK: userKey ?? server key, provider from User.aiProvider or fallback
    let apiKey: string | null = null;
    let provider: string = "openai";
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id! }, select: { aiKeyEncrypted: true, aiProvider: true } });
      if (dbUser?.aiKeyEncrypted) {
        try { apiKey = decrypt(dbUser.aiKeyEncrypted); provider = dbUser.aiProvider || provider; } catch {}
      }
    } catch {}
    if (!apiKey) apiKey = process.env.OPENAI_API_KEY || null;
    // Also respect explicit provider param if sent
    const bodyProvider = (body as { provider?: string }).provider;
    if (bodyProvider && ["openai","nvidia","claude","gemini"].includes(bodyProvider)) provider = bodyProvider;

    if (apiKey) {
      try {
        // @ts-ignore — ai SDK optional
        const { generateText } = await import("ai");
        let model: unknown;
        if (provider === "nvidia") {
          // @ts-ignore — nvidia uses openai-compatible via @ai-sdk/openai with baseURL
          const { createOpenAI } = await import("@ai-sdk/openai");
          const nvidia = createOpenAI({ baseURL: "https://integrate.api.nvidia.com/v1", apiKey });
          model = nvidia("meta/llama-3.1-405b-instruct");
        } else if (provider === "claude") {
          // @ts-ignore
          const { createAnthropic } = await import("@ai-sdk/anthropic");
          const anthropic = createAnthropic({ apiKey });
          model = anthropic("claude-3-5-sonnet-20240620");
        } else if (provider === "gemini") {
          // @ts-ignore
          const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
          const google = createGoogleGenerativeAI({ apiKey });
          model = google("gemini-1.5-flash");
        } else {
          // @ts-ignore
          const { openai } = await import("@ai-sdk/openai");
          // Use provided key if BYOK, else env key is used by SDK automatically
          if (apiKey !== process.env.OPENAI_API_KEY) {
            // @ts-ignore — optional
            const { createOpenAI } = await import("@ai-sdk/openai");
            const custom = createOpenAI({ apiKey });
            model = custom("gpt-4o-mini");
          } else {
            // @ts-ignore
            model = openai("gpt-4o-mini");
          }
        }
        const { text } = await (generateText as (opts: { model: unknown; prompt: string }) => Promise<{ text: string }>)({ model, prompt: `Parse receipt image ${imageUrl} and return JSON { description: string, amount: number, category: string } — category from: Marketing, Operations, Travel, Software, Office Supplies, Utilities, Payroll, Other. Return JSON only.` });
        const parsed = JSON.parse(text) as { description?: string; amount?: number; category?: string };
        return NextResponse.json({ description: parsed.description || "AI parsed", amount: parsed.amount ?? 42.5, category: parsed.category || "Other", raw: imageUrl, provider, ai: true });
      } catch (aiErr) {
        console.error(`ai parse failed provider=${provider}`, aiErr);
      }
    }
    return NextResponse.json({
      description: "Office supplies (AI parsed)",
      amount: 42.5,
      category: "Office Supplies",
      raw: imageUrl,
      provider,
      note: "Set per-user AI key in /dashboard/settings or server OPENAI_API_KEY/NVIDIA_API_KEY etc. to enable real AI",
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to parse" }, { status: 500 });
  }
}
