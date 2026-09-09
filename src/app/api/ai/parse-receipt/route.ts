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
    // Placeholder — return mocked parse
    return NextResponse.json({
      description: "Office supplies (AI parsed)",
      amount: 42.5,
      category: "Office Supplies",
      raw: imageUrl,
      note: "Wire ai SDK: npm i ai @ai-sdk/openai and implement generateText",
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to parse" }, { status: 500 });
  }
}
