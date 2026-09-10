export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-4 w-64 rounded bg-slate-200" />
      </div>
      <div className="rounded-2xl bg-white p-8 shadow">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="mt-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-32 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
