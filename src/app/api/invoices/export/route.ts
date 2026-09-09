import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const format = request.nextUrl.searchParams.get('format') || 'csv';

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id!, deletedAt: null } as never,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    if (format === 'csv') {
      const header = ['invoiceNo', 'clientName', 'clientEmail', 'amount', 'currency', 'status', 'issueDate', 'dueDate', 'createdAt'].join(',');
      const rows = invoices.map((inv) =>
        [
          inv.invoiceNo,
          `"${(inv.clientName || '').replace(/"/g, '""')}"`,
          inv.clientEmail || '',
          inv.amount.toString(),
          inv.currency,
          inv.status,
          new Date(inv.issueDate).toISOString().split('T')[0],
          new Date(inv.dueDate).toISOString().split('T')[0],
          new Date(inv.createdAt).toISOString(),
        ].join(',')
      );
      const csv = [header, ...rows].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="invoices-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(invoices);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Export error', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
