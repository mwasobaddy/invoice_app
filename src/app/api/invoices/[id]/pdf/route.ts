import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

import { InvoicePDF } from "@/components/InvoicePDF";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id!, deletedAt: null } as never,
      include: { items: true, payments: true },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const doc = React.createElement(InvoicePDF, {
      invoice: {
        invoiceNo: invoice.invoiceNo,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        amount: invoice.amount.toString(),
        currency: invoice.currency,
        status: invoice.status as string,
        issueDate: new Date(invoice.issueDate).toISOString().split("T")[0],
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
        description: invoice.description,
        items: invoice.items.map((it) => ({
          description: it.description,
          quantity: it.quantity.toString(),
          rate: it.rate.toString(),
          amount: it.amount.toString(),
        })),
      },
    });

    const stream = await renderToStream(doc as never);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNo}.pdf"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("pdf route error", e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
