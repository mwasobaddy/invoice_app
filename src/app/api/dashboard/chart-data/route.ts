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
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const period = request.nextUrl.searchParams.get('period') || 'monthly';

    // limit range to avoid OOM on large tables — last 12 months or 5 years
    const since = new Date();
    if (period === 'yearly') since.setFullYear(since.getFullYear() - 5);
    else since.setMonth(since.getMonth() - 12);

    const [invoices, expenses, budgets] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId, issueDate: { gte: since }, deletedAt: null } as never,
        include: { payments: true },
        orderBy: { issueDate: 'asc' },
      }),
      prisma.expense.findMany({
        where: { userId, date: { gte: since }, deletedAt: null } as never,
        orderBy: { date: 'asc' },
      }),
      prisma.budget.findMany({
        where: { userId, startDate: { gte: since }, deletedAt: null } as never,
        orderBy: { startDate: 'asc' },
      }),
    ]);

    // Define chart data structure
    interface ChartData {
      period: string;
      invoices: number;
      paidInvoices: number;
      pendingInvoices: number;
      expenses: number;
      budget: number;
    }

    // Organize data by date
    const chartDataMap = new Map<string, ChartData>();

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

      const data = chartDataMap.get(dateKey)!;
      const invAmt = Number((invoice.amount as unknown as { toString(): string }).toString());
      data.invoices += invAmt;

      const paidAmount = invoice.payments.reduce(
        (sum: number, payment: typeof invoice.payments[0]) => sum + Number((payment.amount as unknown as { toString(): string }).toString()),
        0
      );

      if (invoice.status === 'paid') {
        data.paidInvoices += invAmt;
      } else {
        const remaining = invAmt - paidAmount;
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

      const data = chartDataMap.get(dateKey)!;
      data.expenses += Number((expense.amount as unknown as { toString(): string }).toString());
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

      const data = chartDataMap.get(dateKey)!;
      data.budget += Number((budget.limit as unknown as { toString(): string }).toString());
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
