import { NextRequest, NextResponse } from "next/server";

// GET /api/crons/fx — daily FX fetch (placeholder for exchangerate-api)
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    const urlSecret = request.nextUrl.searchParams.get("secret");
    if (auth !== `Bearer ${cronSecret}` && urlSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  // In prod: fetch("https://api.exchangerate-api.com/v4/latest/USD").then(r=>r.json())
  // Store in Currency table or KV
  return NextResponse.json({ message: "FX cron placeholder — wire exchangerate-api here", at: new Date().toISOString() });
}
export const POST = GET;
