import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

// P0: PDF generation — placeholder using @react-pdf/renderer compatible structure
// Full implementation: import { renderToStream } from "@react-pdf/renderer" and send PDF
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id!, deletedAt: null } as never,
      include: { items: true, payments: true },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // For now, return JSON + instruction — replace with actual PDF stream
    // Example real PDF: const stream = await renderToStream(<InvoicePDF invoice={invoice} />)
    // return new NextResponse(stream as unknown as BodyInit, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${invoice.invoiceNo}.pdf"` } });

    return NextResponse.json({
      message: "PDF generation ready — wire @react-pdf/renderer here",
      invoiceNo: invoice.invoiceNo,
      preview: {
        clientName: invoice.clientName,
        amount: invoice.amount.toString(),
        status: invoice.status,
        items: invoice.items.length,
      },
      hint: "Install @react-pdf/renderer already done, implement InvoicePDF component in src/components/InvoicePDF.tsx",
    });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("pdf route error", e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
