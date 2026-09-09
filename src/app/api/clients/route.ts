import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ClientSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(1000).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const q = request.nextUrl.searchParams.get('q')?.trim();
    const where: Record<string, unknown> = { userId: user.id!, deletedAt: null };
    if (q) (where as Record<string, unknown>).OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
    const clients = await prisma.client.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(clients);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const raw = await request.json();
    const parsed = ClientSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    if (data.email) {
      const exists = await prisma.client.findFirst({ where: { userId: user.id!, email: data.email, deletedAt: null } as never });
      if (exists) return NextResponse.json({ error: 'Client with this email already exists' }, { status: 409 });
    }
    const client = await prisma.client.create({
      data: {
        userId: user.id!,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error('Create client error', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
