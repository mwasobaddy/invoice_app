import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/budgets/stats
 * Retrieve budget statistics for the authenticated user
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const userId = user.id;

    // Get all budgets for this user
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        expenses: true,
      },
    });

    // Calculate metrics
    const stats = {
      totalBudget: 0,
      totalBudgets: budgets.length,
      totalSpent: 0,
      totalRemaining: 0,
      budgetsOverspent: 0,
    };

    budgets.forEach((budget: typeof budgets[0]) => {
      const spent = budget.expenses.reduce((sum: number, expense: { amount: number; }) => sum + expense.amount, 0);

      stats.totalBudget += budget.limit;
      stats.totalSpent += spent;
      const remaining = budget.limit - spent;
      stats.totalRemaining += Math.max(0, remaining);

      if (spent > budget.limit) {
        stats.budgetsOverspent += 1;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching budget stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget statistics' },
      { status: 500 }
    );
  }
}
