import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { CreateExpenseSchema, formatZodError } from '@/lib/schemas';

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
    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * pageSize;
    const q = request.nextUrl.searchParams.get('q')?.trim();
    const category = request.nextUrl.searchParams.get('category');
    const where: Record<string, unknown> = { userId };
    if (q) (where as Record<string, unknown>).OR = [{ description: { contains: q, mode: 'insensitive' } }, { category: { contains: q, mode: 'insensitive' } }];
    if (category) (where as Record<string, unknown>).category = category;
    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where: where as never,
        orderBy: { date: 'desc' },
        skip, take: pageSize,
        include: { budget: { select: { id: true, name: true } } },
      }),
      prisma.expense.count({ where: where as never }),
    ]);
    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
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
    const raw = await request.json();
    const parsed = CreateExpenseSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: formatZodError(parsed.error) }, { status: 400 });
    }
    const body = parsed.data;

    const expense = await prisma.expense.create({
      data: {
        userId,
        budgetId: body.budgetId || null,
        description: body.description,
        amount: body.amount,
        category: body.category,
        date: body.date,
        notes: body.notes || null,
        receipt: body.receipt || null,
      },
    });

    // Update budget spent amount if associated with a budget
    if (body.budgetId) {
      const budget = await prisma.budget.findUnique({
        where: { id: body.budgetId },
        include: { expenses: true },
      });

      if (budget) {
        const totalSpent = budget.expenses.reduce((sum: number, exp) => sum + Number((exp.amount as unknown as { toString(): string }).toString()), 0);
        const remaining = Number((budget.limit as unknown as { toString(): string }).toString()) - totalSpent;

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
