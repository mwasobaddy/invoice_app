import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/invoices/[id]
 * Retrieve a specific invoice
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: invoiceId } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/invoices/[id]
 * Update an invoice
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: invoiceId } = await params;
    const body = await request.json();

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone,
        amount: body.amount,
        currency: body.currency,
        status: body.status,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        paidDate: body.paidDate ? new Date(body.paidDate) : undefined,
        description: body.description,
        notes: body.notes,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // audit + fetch userId for log
    const existingForAudit = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { userId: true } });
    if (existingForAudit) await writeAuditLog({ userId: (existingForAudit as { userId: string }).userId, action: "update", entity: "Invoice", entityId: invoiceId, diff: body as Record<string, unknown>, ip: request.headers.get("x-forwarded-for") });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/[id]
 * Delete an invoice
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: invoiceId } = await params;

    const toDelete = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { userId: true } });
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    if (toDelete) await writeAuditLog({ userId: (toDelete as { userId: string }).userId, action: "delete", entity: "Invoice", entityId: invoiceId, ip: request.headers.get("x-forwarded-for") });

    return NextResponse.json(
      { message: 'Invoice deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
