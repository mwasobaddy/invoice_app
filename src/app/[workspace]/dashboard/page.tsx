import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ChartClient from "@/components/ChartClient";

export const revalidate = 60;

async function getInitialChartData(userId: string, orgId: string) {
  const since = new Date();
  since.setMonth(since.getMonth() - 12);
  const invoices = await prisma.invoice.findMany({ where: { userId, orgId, issueDate: { gte: since }, deletedAt: null } as never, include: { payments: true } });
  const expenses = await prisma.expense.findMany({ where: { userId, orgId, date: { gte: since }, deletedAt: null } as never });
  const budgets = await prisma.budget.findMany({ where: { userId, orgId, startDate: { gte: since }, deletedAt: null } as never });
  const map = new Map<string, { period: string; invoices: number; paidInvoices: number; pendingInvoices: number; expenses: number; budget: number }>();
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  const label = (k: string) => { const [y,m]=k.split("-"); return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${y}`; };
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

export default async function WorkspaceDashboardPage({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  const org = await prisma.org.findUnique({ where: { slug: workspace } });
  if (!org) notFound();
  const membership = await prisma.membership.findUnique({ where: { userId_orgId: { userId: session.user.id, orgId: org.id } } as never });
  if (!membership) notFound();

  const initialData = await getInitialChartData(session.user.id, org.id);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{org.name} • Workspace</p>
        <h1 className="text-3xl font-semibold text-slate-900">Overview — {org.name}</h1>
        <p className="text-sm text-slate-600">Strict filter: showing only {org.name} data. Switch via Organization Switcher.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link href={`/${workspace}/invoices`} className="group">
          <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Invoices</h3>
            <p className="text-slate-600 text-sm">Manage your invoices for {org.name}.</p>
            <div className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white">View Invoices</div>
          </div>
        </Link>
        <Link href={`/${workspace}/budgets`} className="group">
          <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Budgets</h3>
            <p className="text-slate-600 text-sm">Budgets for {org.name}.</p>
            <div className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white">View Budgets</div>
          </div>
        </Link>
        <Link href={`/${workspace}/expenses`} className="group">
          <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Expenses</h3>
            <p className="text-slate-600 text-sm">Expenses for {org.name}.</p>
            <div className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white">View Expenses</div>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-md shadow-slate-200/60">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Financial Overview — {org.name}</h2>
          <p className="text-sm text-slate-600 mt-1">Strict filter: months vs money for {org.name}</p>
        </div>
        <ChartClient data={initialData} />
      </div>
    </section>
  );
}
