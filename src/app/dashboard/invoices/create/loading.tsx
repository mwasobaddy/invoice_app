export default function CreateInvoiceLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-pulse">
      <div className="h-32 rounded-2xl bg-white p-6 shadow">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-64 rounded bg-slate-200" />
      </div>
      <div className="rounded-2xl bg-white p-8 shadow">
        <div className="h-8 w-40 rounded bg-slate-200" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="mt-6 h-32 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
