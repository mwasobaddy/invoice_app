export default function InvoicesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-slate-200" />
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-4 w-64 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-36 rounded-2xl bg-slate-200" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white p-8 shadow">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="mt-4 h-8 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex justify-between">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="h-8 w-24 rounded-xl bg-slate-200" />
        </div>
        <div className="mt-6 h-64 rounded-xl bg-slate-100" />
      </div>
      <div className="rounded-2xl bg-white p-8 shadow">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="mt-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
