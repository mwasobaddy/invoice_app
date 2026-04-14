import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dashboard/chart-data
 * Retrieve aggregated financial data for chart visualization
 * Query params: period=monthly|yearly (default: monthly)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const userId = user.id;
    const period = request.nextUrl.searchParams.get('period') || 'monthly';

    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: { payments: true },
    });

    const expenses = await prisma.expense.findMany({
      where: { userId },
    });

    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

    // Organize data by date
    const chartDataMap = new Map<string, any>();

    // Helper to get date key based on period
    const getDateKey = (date: Date) => {
      if (period === 'yearly') {
        return date.getFullYear().toString();
      } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      }
    };

    // Helper to get display label
    const getDisplayLabel = (dateKey: string) => {
      if (period === 'yearly') {
        return dateKey;
      } else {
        const [year, month] = dateKey.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }
    };

    // Initialize data from invoices
    invoices.forEach((invoice: typeof invoices[0]) => {
      const dateKey = getDateKey(invoice.issueDate);

      if (!chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, {
          period: getDisplayLabel(dateKey),
          invoices: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          expenses: 0,
          budget: 0,
        });
      }

      const data = chartDataMap.get(dateKey);
      data.invoices += invoice.amount;

      const paidAmount = invoice.payments.reduce(
        (sum: number, payment: typeof invoice.payments[0]) => sum + payment.amount,
        0
      );

      if (invoice.status === 'paid') {
        data.paidInvoices += invoice.amount;
      } else {
        const remaining = invoice.amount - paidAmount;
        data.pendingInvoices += remaining > 0 ? remaining : 0;
      }
    });

    // Add expenses data
    expenses.forEach((expense: typeof expenses[0]) => {
      const dateKey = getDateKey(expense.date);

      if (!chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, {
          period: getDisplayLabel(dateKey),
          invoices: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          expenses: 0,
          budget: 0,
        });
      }

      const data = chartDataMap.get(dateKey);
      data.expenses += expense.amount;
    });

    // Add budgets data
    budgets.forEach((budget: typeof budgets[0]) => {
      const dateKey = getDateKey(budget.startDate);

      if (!chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, {
          period: getDisplayLabel(dateKey),
          invoices: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          expenses: 0,
          budget: 0,
        });
      }

      const data = chartDataMap.get(dateKey);
      data.budget += budget.limit;
    });

    // Sort by date
    const sortedData = Array.from(chartDataMap.entries())
      .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
      .map(([, data]) => ({
        period: data.period,
        invoices: Math.round(data.invoices * 100) / 100,
        paidInvoices: Math.round(data.paidInvoices * 100) / 100,
        pendingInvoices: Math.round(data.pendingInvoices * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
        budget: Math.round(data.budget * 100) / 100,
      }));

    return NextResponse.json(sortedData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
