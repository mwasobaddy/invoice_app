import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ChartClient from "@/components/ChartClient";

export const metadata = { title: "Overview — Invoice Atlas", description: "Dashboard overview" };
export const revalidate = 60;

async function getInitialChartData(userId: string) {
  const since = new Date();
  since.setMonth(since.getMonth() - 12);
  const invoices = await prisma.invoice.findMany({ where: { userId, issueDate: { gte: since }, deletedAt: null } as never, include: { payments: true } });
  const expenses = await prisma.expense.findMany({ where: { userId, date: { gte: since }, deletedAt: null } as never });
  const budgets = await prisma.budget.findMany({ where: { userId, startDate: { gte: since }, deletedAt: null } as never });
  // Simple monthly bucket
  const map = new Map<string, { period: string; invoices: number; paidInvoices: number; pendingInvoices: number; expenses: number; budget: number }>();
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  const label = (k: string) => { const [y,m]=k.split("-"); return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m)-1]} ${y}`; };
  const ensure = (k: string) => { if(!map.has(k)) map.set(k,{ period: label(k), invoices:0, paidInvoices:0, pendingInvoices:0, expenses:0, budget:0 }); return map.get(k)!; };
  invoices.forEach((inv: { issueDate: Date; amount: { toString(): string }; status: string; payments: Array<{ amount: { toString(): string }}> }) => {
    const k = fmt(inv.issueDate); const d = ensure(k); const amt = Number(inv.amount.toString());
    d.invoices += amt;
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount.toString()), 0);
    if (inv.status === "paid") d.paidInvoices += amt; else d.pendingInvoices += Math.max(0, amt - paid);
  });
  expenses.forEach((e: { date: Date; amount: { toString(): string } }) => { const k = fmt(e.date); ensure(k).expenses += Number(e.amount.toString()); });
  budgets.forEach((b: { startDate: Date; limit: { toString(): string } }) => { const k = fmt(b.startDate); ensure(k).budget += Number(b.limit.toString()); });
  return Array.from(map.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([,v]) => v);
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  // Redirect to workspace-specific URL: /[slug]/dashboard
  const membership = await prisma.membership.findFirst({ where: { userId: session.user.id }, include: { org: true }, orderBy: { createdAt: 'asc' } });
  if (membership?.org?.slug) redirect(`/${membership.org.slug}/dashboard`);
  const initialData = await getInitialChartData(session.user.id);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your workspace</p>
        <h1 className="text-3xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-600">Keep tabs on invoices, budgets, and spending — server-rendered with revalidate.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/dashboard/invoices" className="group">
          <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Invoices</h3>
            <p className="text-slate-600 text-sm">Manage your invoices and track payments.</p>
            <div className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white">View Invoices</div>
          </div>
        </Link>
        <Link href="/dashboard/budgets" className="group">
          <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Budgets</h3>
            <p className="text-slate-600 text-sm">Set spending targets and keep costs aligned.</p>
            <div className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white">View Budgets</div>
          </div>
        </Link>
        <Link href="/dashboard/expenses" className="group">
          <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Expenses</h3>
            <p className="text-slate-600 text-sm">Track and categorize cash flowing out.</p>
            <div className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white">View Expenses</div>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-md shadow-slate-200/60">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Financial Overview</h2>
          <p className="text-sm text-slate-600 mt-1">Server-rendered initial data + client ChartClient for period toggle</p>
        </div>
        <ChartClient data={initialData} />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5 text-sm text-slate-600">
          {["Total Invoices","Paid Invoices","Pending Invoices","Total Expenses","Total Budget"].map((l,i)=>(
            <div key={l} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: ["#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6"][i]}} />{l}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
