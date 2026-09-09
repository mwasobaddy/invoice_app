'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h2 className="text-lg font-semibold text-slate-900">Application error</h2>
          <p className="mt-2 text-sm text-slate-600">{error.message}</p>
          <button
            onClick={() => reset()}
            className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
