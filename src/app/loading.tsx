export default function Loading() {
  return (
    <div className="animate-fade-up space-y-6 p-6">
      <div className="h-6 w-32 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-white shadow-md shadow-slate-200/60" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-white shadow-md" />
    </div>
  );
}
