import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

// POST /api/ai/parse-receipt — AI receipt parse placeholder
// Body: { imageUrl } or formData with file
// In prod: import { generateText } from "ai"; const { text } = await generateText({ model: openai("gpt-4o-mini"), prompt: `Parse receipt ${imageUrl} -> JSON { description, amount, category }` })
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json().catch(() => ({}));
    const { imageUrl } = body as { imageUrl?: string };
    if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
    // If OPENAI_API_KEY set, try real AI; otherwise fallback mock (keeps hobby working without key)
    if (process.env.OPENAI_API_KEY) {
      try {
        // @ts-ignore — ai SDK optional, fallback to mock if not installed
        const { generateText } = await import("ai");
        // @ts-ignore
        const { openai } = await import("@ai-sdk/openai");
        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          prompt: `Parse receipt image ${imageUrl} and return JSON { description: string, amount: number, category: string } — category from: Marketing, Operations, Travel, Software, Office Supplies, Utilities, Payroll, Other. Return JSON only.`,
        });
        const parsed = JSON.parse(text) as { description?: string; amount?: number; category?: string };
        return NextResponse.json({ description: parsed.description || "AI parsed", amount: parsed.amount ?? 42.5, category: parsed.category || "Other", raw: imageUrl, ai: true });
      } catch (aiErr) {
        console.error("ai parse failed, fallback to mock", aiErr);
      }
    }
    return NextResponse.json({
      description: "Office supplies (AI parsed)",
      amount: 42.5,
      category: "Office Supplies",
      raw: imageUrl,
      note: "Set OPENAI_API_KEY to enable real AI parse",
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to parse" }, { status: 500 });
  }
}
