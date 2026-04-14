import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/budgets/[id]
 * Retrieve a specific budget
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: budgetId } = await params;

    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        expenses: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/budgets/[id]
 * Update a budget
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: budgetId } = await params;
    const body = await request.json();

    const existing = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { expenses: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    const spent = existing.expenses.reduce((sum: number, exp: { amount: number; }) => sum + exp.amount, 0);
    const nextLimit = body.limit ?? existing.limit;
    const remaining = nextLimit - spent;

    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        name: body.name ?? existing.name,
        limit: nextLimit,
        spent,
        remaining: Math.max(remaining, 0),
        period: body.period ?? existing.period,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        category: body.category ?? existing.category,
        color: body.color ?? existing.color,
        isActive: body.isActive ?? existing.isActive,
      },
      include: {
        expenses: true,
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/budgets/[id]
 * Delete a budget
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: budgetId } = await params;

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return NextResponse.json(
      { message: 'Budget deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
