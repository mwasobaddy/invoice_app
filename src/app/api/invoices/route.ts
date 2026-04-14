import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

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
    const pageParam = request.nextUrl.searchParams.get('page');
    const limitParam = request.nextUrl.searchParams.get('limit');

    if (pageParam && limitParam) {
      const page = Math.max(1, parseInt(pageParam, 10) || 1);
      const pageSize = Math.max(1, parseInt(limitParam, 10) || 10);
      const skip = (page - 1) * pageSize;

      const [items, total] = await Promise.all([
        prisma.invoice.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
          select: {
            id: true,
            invoiceNo: true,
            clientName: true,
            amount: true,
            status: true,
            issueDate: true,
            dueDate: true,
            createdAt: true,
          },
        }),
        prisma.invoice.count({ where: { userId } }),
      ]);

      return NextResponse.json({ items, total, page, pageSize });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
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
    const body = await request.json();

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNo: body.invoiceNo,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientPhone: body.clientPhone,
        amount: body.amount,
        currency: body.currency || 'USD',
        status: body.status || 'draft',
        issueDate: new Date(body.issueDate),
        dueDate: new Date(body.dueDate),
        description: body.description,
        notes: body.notes,
        items: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: body.items?.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })) || [],
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
