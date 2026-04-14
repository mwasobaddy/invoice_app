import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/expenses/stats
 * Retrieve expense statistics for the authenticated user
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const userId = user.id;

    // Get all expenses for this user
    const expenses = await prisma.expense.findMany({
      where: { userId },
      include: {
        budget: true,
      },
    });

    // Get all budgets for comparison
    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

    // Calculate metrics
    const stats = {
      totalExpenses: expenses.length,
      totalAmount: 0,
      averageExpense: 0,
      activeBudgets: budgets.length,
      expensesThisMonth: 0,
      amountThisMonth: 0,
    };

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    expenses.forEach((expense: typeof expenses[0]) => {
      stats.totalAmount += expense.amount;

      // Count expenses this month
      if (expense.date >= currentMonth && expense.date <= currentMonthEnd) {
        stats.expensesThisMonth += 1;
        stats.amountThisMonth += expense.amount;
      }
    });

    stats.averageExpense = expenses.length > 0 ? stats.totalAmount / expenses.length : 0;

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense statistics' },
      { status: 500 }
    );
  }
}
