import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/expenses
 * Retrieve all expenses for the authenticated user
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
        prisma.expense.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          skip,
          take: pageSize,
          include: {
            budget: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.expense.count({ where: { userId } }),
      ]);

      return NextResponse.json({ items, total, page, pageSize });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();

    const expense = await prisma.expense.create({
      data: {
        userId,
        budgetId: body.budgetId,
        description: body.description,
        amount: body.amount,
        category: body.category,
        date: new Date(body.date),
        notes: body.notes,
        receipt: body.receipt,
      },
    });

    // Update budget spent amount if associated with a budget
    if (body.budgetId) {
      const budget = await prisma.budget.findUnique({
        where: { id: body.budgetId },
        include: { expenses: true },
      });

      if (budget) {
        const totalSpent = budget.expenses.reduce(
          (sum: number, exp: { amount: number; }) => sum + exp.amount,
          0
        );
        const remaining = budget.limit - totalSpent;

        await prisma.budget.update({
          where: { id: body.budgetId },
          data: {
            spent: totalSpent,
            remaining: Math.max(remaining, 0),
          },
        });
      }
    }

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
