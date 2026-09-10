export const dynamic = 'force-dynamic';

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
    const orgId = request.nextUrl.searchParams.get('orgId');
    const where: Record<string, unknown> = { userId };
    if (orgId) {
      const mem = await prisma.membership.findUnique({ where: { userId_orgId: { userId, orgId } } as never });
      if (!mem) return NextResponse.json({ error: 'Not a member' }, { status: 403 });
      (where as Record<string, unknown>).orgId = orgId;
    }
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

    const orgId = (raw as { orgId?: string }).orgId || request.headers.get('x-org-id') || null;
    if (orgId) {
      const mem = await prisma.membership.findUnique({ where: { userId_orgId: { userId, orgId } } as never });
      if (!mem) return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }
    const expense = await prisma.expense.create({
      data: {
        userId,
        orgId: orgId || null,
        budgetId: body.budgetId || null,
        description: body.description,
        amount: body.amount,
        category: body.category,
        date: body.date,
        notes: body.notes || null,
        receipt: body.receipt || null,
      },
    });

    // Audit log
    const { writeAuditLog } = await import("@/lib/audit");
    await writeAuditLog({ userId, action: "create", entity: "Expense", entityId: expense.id, diff: body as Record<string, unknown>, ip: request.headers.get("x-forwarded-for") });

    // Update budget + budget alert (P1: >80% spent)
    if (body.budgetId) {
      const budget = await prisma.budget.findUnique({
        where: { id: body.budgetId },
        include: { expenses: true },
      });

      if (budget) {
        const totalSpent = budget.expenses.reduce((sum: number, exp) => sum + Number((exp.amount as unknown as { toString(): string }).toString()), 0);
        const limit = Number((budget.limit as unknown as { toString(): string }).toString());
        const remaining = limit - totalSpent;

        await prisma.budget.update({
          where: { id: body.budgetId },
          data: {
            spent: totalSpent,
            remaining: Math.max(remaining, 0),
          },
        });

        // Budget alert: log + audit when >80%
        if (totalSpent > limit * 0.8) {
          await writeAuditLog({ userId, action: "budget_alert", entity: "Budget", entityId: budget.id, diff: { totalSpent, limit, pct: Math.round((totalSpent/limit)*100) }, ip: null });
          console.warn(`Budget alert: ${budget.name} ${Math.round((totalSpent/limit)*100)}% spent`);
        }
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
