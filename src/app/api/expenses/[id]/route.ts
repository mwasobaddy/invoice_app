import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/expenses/[id]
 * Retrieve a specific expense
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: expenseId } = await params;

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/expenses/[id]
 * Update an expense
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: expenseId } = await params;
    const body = await request.json();

    // Get the old expense to calculate budget changes
    const oldExpense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!oldExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        description: body.description,
        amount: body.amount,
        category: body.category,
        date: body.date ? new Date(body.date) : undefined,
        notes: body.notes,
        receipt: body.receipt,
      },
    });

    // Update budget spent amount if the expense is associated with a budget
    if (oldExpense.budgetId) {
      const budget = await prisma.budget.findUnique({
        where: { id: oldExpense.budgetId },
        include: { expenses: true },
      });

      if (budget) {
        const totalSpent = budget.expenses.reduce(
          (sum: number, exp: { amount: number }) => sum + exp.amount,
          0
        );
        const remaining = budget.limit - totalSpent;

        await prisma.budget.update({
          where: { id: oldExpense.budgetId },
          data: {
            spent: totalSpent,
            remaining: Math.max(remaining, 0),
          },
        });
      }
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expenses/[id]
 * Delete an expense
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: expenseId } = await params;

    // Get the expense before deleting to get budget info
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    // Update budget spent amount if the expense was associated with a budget
    if (expense.budgetId) {
      const budget = await prisma.budget.findUnique({
        where: { id: expense.budgetId },
        include: { expenses: true },
      });

      if (budget) {
        const totalSpent = budget.expenses.reduce(
          (sum: number, exp) => sum + exp.amount,
          0
        );
        const remaining = budget.limit - totalSpent;

        await prisma.budget.update({
          where: { id: expense.budgetId },
          data: {
            spent: totalSpent,
            remaining: Math.max(remaining, 0),
          },
        });
      }
    }

    return NextResponse.json(
      { message: 'Expense deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
