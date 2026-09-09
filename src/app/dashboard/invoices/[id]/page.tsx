import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Invoice Detail — Invoice Atlas" };

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.user.id, deletedAt: null } as never,
    include: { items: true, payments: true },
  });
  if (!invoice) notFound();

  return (
    <section className="space-y-6">
      <Link href="/dashboard/invoices" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to invoices
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{invoice.invoiceNo}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{invoice.clientName}</h1>
          <p className="text-sm text-slate-600">{invoice.clientEmail || "—"} • {invoice.status as string}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800"
          >
            Download PDF
          </a>
          <Link href={`/dashboard/invoices`} className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">
            Edit
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Amount</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{invoice.currency} {invoice.amount.toString()}</p>
        <p className="mt-1 text-xs text-slate-500">Due {new Date(invoice.dueDate).toLocaleDateString()} • Issued {new Date(invoice.issueDate).toLocaleDateString()}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-sm font-semibold text-slate-900">Line Items</h2>
        <div className="mt-4 space-y-2">
          {invoice.items.map((it) => (
            <div key={it.id} className="flex justify-between rounded-xl border border-slate-200 p-3 text-sm">
              <span>{it.description}</span>
              <span className="text-slate-600">{it.quantity.toString()} × {it.rate.toString()} = {it.amount.toString()}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
