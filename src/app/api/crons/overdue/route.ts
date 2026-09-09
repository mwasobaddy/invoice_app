import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Vercel Cron: 0 2 * * *  — requires CRON_SECRET
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  // Allow Vercel cron (no auth in hobby) or bearer secret if set
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also allow ?secret= for manual trigger
    const urlSecret = request.nextUrl.searchParams.get('secret');
    if (urlSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const now = new Date();
  const result = await prisma.invoice.updateMany({
    where: {
      status: 'sent',
      dueDate: { lt: now },
      deletedAt: null,
    } as never,
    data: { status: 'overdue' },
  });

  // Optional: log to AuditLog per user? For now return count
  return NextResponse.json({ updated: result.count, at: now.toISOString() });
}

// Also allow POST for manual invoke from dashboard
export const POST = GET;
