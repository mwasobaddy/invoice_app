export default function DashboardLoading() {
  return (
    <section className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-4 w-96 rounded bg-slate-200" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-white p-6 shadow">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="mt-4 h-8 w-32 rounded bg-slate-200" />
            <div className="mt-6 h-4 w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-8 shadow">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="mt-6 h-72 rounded-xl bg-slate-100" />
      </div>
    </section>
  );
}
