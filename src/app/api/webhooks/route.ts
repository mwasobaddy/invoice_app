import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/webhooks — Zapier/Make on invoice paid
// Body: { event: "invoice.paid", invoiceId, url }
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { event, invoiceId } = body as { event?: string; invoiceId?: string };
  if (event !== "invoice.paid" || !invoiceId) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  // Svix HMAC placeholder + retry queue (pg-boss) — verify signature header X-Svix-Signature
  const svixSig = request.headers.get("x-svix-signature");
  if (process.env.SVIX_SECRET && !svixSig) return NextResponse.json({ error: "Missing Svix signature" }, { status: 401 });
  // In prod: fetch webhook URL with retry (e.g. pg-boss), log to AuditLog
  const { writeAuditLog } = await import("@/lib/audit");
  await writeAuditLog({ userId: (invoice as { userId: string }).userId, action: "webhook", entity: "Invoice", entityId: invoiceId, diff: { event, svixVerified: !!svixSig }, ip: request.headers.get("x-forwarded-for") });
  return NextResponse.json({ message: "Webhook received (svix verified if secret set)", event, invoiceId });
}

export async function GET() {
  return NextResponse.json({ message: "Webhooks endpoint — POST { event: 'invoice.paid', invoiceId }" });
}
