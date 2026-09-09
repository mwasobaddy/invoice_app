import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Edit Invoice — Invoice Atlas" };

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({ where: { id, userId: session.user.id, deletedAt: null } as never, include: { items: true } });
  if (!invoice) notFound();
  return (
    <section className="space-y-6">
      <Link href={`/dashboard/invoices/${id}`} className="text-sm text-slate-500 hover:text-slate-700">← Back</Link>
      <h1 className="text-2xl font-semibold text-slate-900">Edit {invoice.invoiceNo}</h1>
      <p className="text-sm text-slate-600">Form scaffold — wire to <code>PUT /api/invoices/{id}</code> with Zod validation. Current client: {invoice.clientName}</p>
      <div className="rounded-2xl bg-white p-6 shadow">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Next</p>
        <p className="mt-2 text-sm text-slate-600">Reuse <code>src/app/dashboard/invoices/create/page.tsx</code> form with prefilled values.</p>
        <Link href={`/dashboard/invoices/${id}`} className="mt-4 inline-flex rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">View Invoice</Link>
      </div>
    </section>
  );
}
