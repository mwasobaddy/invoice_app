import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { CreateInvoiceSchema, formatZodError } from '@/lib/schemas';
import { calculateInvoiceTotal, generateInvoiceNumber } from '@/lib/utils';

/**
 * GET /api/invoices
 * Retrieve all invoices for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * pageSize;
    const q = request.nextUrl.searchParams.get('q')?.trim();
    const status = request.nextUrl.searchParams.get('status');
    const sort = request.nextUrl.searchParams.get('sort') || 'createdAt:desc';
    const [sortField, sortDir] = sort.split(':');
    const allowedSort = ['createdAt', 'dueDate', 'amount', 'invoiceNo'];
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[allowedSort.includes(sortField) ? sortField : 'createdAt'] = sortDir === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = { userId };
    if (q) {
      (where as Record<string, unknown>).OR = [
        { invoiceNo: { contains: q, mode: 'insensitive' } },
        { clientName: { contains: q, mode: 'insensitive' } },
        { clientEmail: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (status && ['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(status)) {
      (where as Record<string, unknown>).status = status;
    }

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where: where as never,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          invoiceNo: true,
          clientName: true,
          clientEmail: true,
          amount: true,
          status: true,
          issueDate: true,
          dueDate: true,
          createdAt: true,
        },
      }),
      prisma.invoice.count({ where: where as never }),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const raw = await request.json();

    // Enforce 1mb body limit (approx)
    if (JSON.stringify(raw).length > 1_000_000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const parsed = CreateInvoiceSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: formatZodError(parsed.error) }, { status: 400 });
    }
    const body = parsed.data;

    const computedAmount = calculateInvoiceTotal(body.items);
    const amount = body.amount ?? computedAmount;
    const invoiceNo = body.invoiceNo?.trim() || generateInvoiceNumber();

    // Unique check per user (schema has @@unique([userId, invoiceNo]))
    const exists = await prisma.invoice.findUnique({ where: { userId_invoiceNo: { userId, invoiceNo } } as never });
    if (exists) {
      return NextResponse.json({ error: 'Invoice number already exists' }, { status: 409 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNo,
        clientName: body.clientName,
        clientEmail: body.clientEmail || null,
        clientPhone: body.clientPhone || null,
        amount,
        currency: body.currency,
        status: body.status,
        issueDate: body.issueDate,
        dueDate: body.dueDate,
        description: body.description || null,
        notes: body.notes || null,
        items: {
          create: body.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
