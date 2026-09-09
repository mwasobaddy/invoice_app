'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-red-500">Something went wrong</p>
        <h2 className="mt-3 text-lg font-semibold text-slate-900">We couldn&apos;t load this page</h2>
        <p className="mt-2 text-sm text-slate-600">{error.message || 'An unexpected error occurred.'}</p>
        {error.digest && <p className="mt-2 text-xs text-slate-400">Digest: {error.digest}</p>}
        <button
          onClick={() => reset()}
          className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
