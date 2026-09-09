import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/invoices/stats
 * Retrieve invoice statistics for the authenticated user
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const userId = user.id;

    // Get all invoices for this user
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        payments: true,
      },
    });

    // Calculate metrics
    const stats = {
      totalAmount: 0,
      totalInvoices: invoices.length,
      pendingAmount: 0,
      pendingInvoices: 0,
      paidAmount: 0,
      paidInvoices: 0,
    };

    invoices.forEach((invoice: typeof invoices[0]) => {
      const amt = Number((invoice.amount as unknown as { toString(): string }).toString());
      stats.totalAmount += amt;
      const paidAmount = invoice.payments.reduce((sum: number, payment: typeof invoice.payments[0]) => sum + Number((payment.amount as unknown as { toString(): string }).toString()), 0);
      if (invoice.status === 'paid') {
        stats.paidAmount += amt;
        stats.paidInvoices += 1;
      } else if (['draft', 'sent', 'overdue'].includes(invoice.status)) {
        stats.pendingAmount += amt - paidAmount;
        stats.pendingInvoices += 1;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice statistics' },
      { status: 500 }
    );
  }
}
