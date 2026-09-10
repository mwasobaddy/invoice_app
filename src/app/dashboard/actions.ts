"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Server Action for ChartClient period toggle — replaces client fetch('/api/dashboard/chart-data')
export async function getChartData(period: "monthly" | "yearly", orgId?: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;
  if (orgId) {
    const mem = await prisma.membership.findUnique({ where: { userId_orgId: { userId, orgId } } as never });
    if (!mem) throw new Error("Not a member");
  }
  const since = new Date();
  if (period === "yearly") since.setFullYear(since.getFullYear() - 5);
  else since.setMonth(since.getMonth() - 12);

  const orgFilter = orgId ? { orgId } as never : undefined;
  const [invoices, expenses, budgets] = await Promise.all([
    prisma.invoice.findMany({ where: { userId, issueDate: { gte: since }, deletedAt: null, ...(orgFilter ? { orgId } : {}) } as never, include: { payments: true } }),
    prisma.expense.findMany({ where: { userId, date: { gte: since }, deletedAt: null, ...(orgFilter ? { orgId } : {}) } as never }),
    prisma.budget.findMany({ where: { userId, startDate: { gte: since }, deletedAt: null, ...(orgFilter ? { orgId } : {}) } as never }),
  ]);

  const map = new Map<string, { period: string; invoices: number; paidInvoices: number; pendingInvoices: number; expenses: number; budget: number }>();
  const fmt = (d: Date) => period === "yearly" ? `${d.getFullYear()}` : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  const label = (k: string) => period === "yearly" ? k : `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(k.split("-")[1])-1]} ${k.split("-")[0]}`;
  const ensure = (k: string) => { if(!map.has(k)) map.set(k,{ period: label(k), invoices:0, paidInvoices:0, pendingInvoices:0, expenses:0, budget:0 }); return map.get(k)!; };
  invoices.forEach((inv: { issueDate: Date; amount: { toString(): string }; status: string; payments: Array<{ amount: { toString(): string }}> }) => {
    const k = fmt(inv.issueDate); const d = ensure(k); const amt = Number(inv.amount.toString());
    d.invoices += amt; const paid = inv.payments.reduce((s, p) => s + Number(p.amount.toString()), 0);
    if (inv.status === "paid") d.paidInvoices += amt; else d.pendingInvoices += Math.max(0, amt - paid);
  });
  expenses.forEach((e: { date: Date; amount: { toString(): string } }) => ensure(fmt(e.date)).expenses += Number(e.amount.toString()));
  budgets.forEach((b: { startDate: Date; limit: { toString(): string } }) => ensure(fmt(b.startDate)).budget += Number(b.limit.toString()));
  return Array.from(map.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v);
}
