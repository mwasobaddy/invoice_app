import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { CreateBudgetSchema, formatZodError } from '@/lib/schemas';

/**
 * GET /api/budgets
 * Retrieve all budgets for the authenticated user
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
    const where: Record<string, unknown> = { userId };
    if (q) (where as Record<string, unknown>).OR = [{ name: { contains: q, mode: 'insensitive' } }, { category: { contains: q, mode: 'insensitive' } }];
    const [items, total] = await Promise.all([
      prisma.budget.findMany({
        where: where as never,
        include: { expenses: { orderBy: { date: 'desc' } } },
        orderBy: { createdAt: 'desc' },
        skip, take: pageSize,
      }),
      prisma.budget.count({ where: where as never }),
    ]);
    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

/**
 * POST /api/budgets
 * Create a new budget
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const raw = await request.json();
    const parsed = CreateBudgetSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: formatZodError(parsed.error) }, { status: 400 });
    }
    const body = parsed.data;
    const remaining = body.limit - (body.spent || 0);
    const budget = await prisma.budget.create({
      data: {
        userId,
        name: body.name,
        limit: body.limit,
        spent: body.spent || 0,
        remaining,
        period: body.period,
        startDate: body.startDate,
        endDate: body.endDate,
        category: body.category || null,
        color: body.color || null,
        isActive: body.isActive,
      },
    });
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
