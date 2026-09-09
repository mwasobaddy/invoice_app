import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/crons/recurring — create next invoice for recurringRule=monthly where nextDueDate <= now
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    const urlSecret = request.nextUrl.searchParams.get("secret");
    if (auth !== `Bearer ${cronSecret}` && urlSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const now = new Date();
  const due = await prisma.invoice.findMany({
    where: { recurringRule: { not: null }, nextDueDate: { lte: now }, deletedAt: null } as never,
    include: { items: true },
  });
  let created = 0;
  for (const inv of due) {
    const nextDue = new Date(inv.nextDueDate as unknown as Date);
    nextDue.setMonth(nextDue.getMonth() + 1);
    await prisma.invoice.create({
      data: {
        userId: inv.userId,
        invoiceNo: `${inv.invoiceNo}-R${Date.now().toString().slice(-4)}`,
        clientName: inv.clientName,
        clientEmail: inv.clientEmail,
        clientPhone: inv.clientPhone,
        amount: inv.amount,
        currency: inv.currency,
        status: "draft" as never,
        issueDate: now,
        dueDate: nextDue,
        recurringRule: inv.recurringRule,
        nextDueDate: nextDue,
        description: inv.description,
        notes: inv.notes,
        items: { create: inv.items.map((it) => ({ description: it.description, quantity: it.quantity, rate: it.rate, amount: it.amount })) },
      },
    });
    await prisma.invoice.update({ where: { id: inv.id }, data: { nextDueDate: nextDue } as never });
    created += 1;
  }
  return NextResponse.json({ created, at: now.toISOString() });
}
export const POST = GET;
