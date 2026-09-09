export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}
