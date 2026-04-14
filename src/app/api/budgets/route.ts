import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

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
    const pageParam = request.nextUrl.searchParams.get('page');
    const limitParam = request.nextUrl.searchParams.get('limit');

    if (pageParam && limitParam) {
      const page = Math.max(1, parseInt(pageParam, 10) || 1);
      const pageSize = Math.max(1, parseInt(limitParam, 10) || 10);
      const skip = (page - 1) * pageSize;

      const [items, total] = await Promise.all([
        prisma.budget.findMany({
          where: { userId },
          include: {
            expenses: {
              orderBy: { date: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.budget.count({ where: { userId } }),
      ]);

      return NextResponse.json({ items, total, page, pageSize });
    }

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        expenses: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
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
    const body = await request.json();

    const remaining = body.limit - (body.spent || 0);

    const budget = await prisma.budget.create({
      data: {
        userId,
        name: body.name,
        limit: body.limit,
        spent: body.spent || 0,
        remaining,
        period: body.period || 'monthly',
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        category: body.category,
        color: body.color,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
