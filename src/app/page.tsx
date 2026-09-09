'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { FileText, Wallet, TrendingUp, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <p className="text-sm font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  if (status === 'authenticated') return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Invoice Atlas
            </span>
            <span className="hidden rounded-full bg-lime-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 sm:inline-flex">
              Osmo
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/auth/signin"
              className="hidden rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left copy */}
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live metrics • Trusted by founders
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Manage invoices,
                <span className="block text-slate-400">track budgets.</span>
                <span className="block">In one Atlas.</span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-6 text-slate-600">
                The premium invoice manager for modern teams. Create invoices with line items, record payments, and keep budgets on track — all with a calm, slate & lime system built for clarity.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800"
                >
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-slate-400" /> Secure by design
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-slate-400" /> No credit card
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-slate-400" /> Real-time
                </span>
              </div>
            </div>

            {/* Right preview — brand-matched dark card like auth pages */}
            <div className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/30 sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1e3a8a_0%,transparent_50%),radial-gradient(circle_at_80%_10%,#0f172a_0%,transparent_55%),radial-gradient(circle_at_70%_80%,#1f2937_0%,transparent_50%)]" />
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.25) 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">Invoice Atlas • Osmo</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
                  </span>
                </div>

                <div className="mx-auto mt-8 flex w-full max-w-[300px] flex-col rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 p-6 shadow-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Dashboard</span>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] uppercase tracking-widest">Osmo</span>
                  </div>

                  <div className="mt-6 rounded-2xl bg-lime-300/90 p-4 text-slate-900 shadow-lg">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-700">Revenue</p>
                    <p className="mt-1 text-2xl font-semibold">$62,746</p>
                    <p className="mt-1 text-xs text-slate-700">+12% vs last month</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-3">
                      <p className="text-xs text-slate-400">Invoices</p>
                      <p className="mt-1 text-lg font-semibold">120</p>
                      <p className="text-[11px] text-emerald-400">86% paid</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-3">
                      <p className="text-xs text-slate-400">Budgets</p>
                      <p className="mt-1 text-lg font-semibold">4 active</p>
                      <p className="text-[11px] text-amber-300">2 on watch</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Sales</p>
                    <p className="mt-2 text-xl font-semibold">$35,647</p>
                    <p className="mt-1 text-xs text-slate-400">+4% this week</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Expenses</p>
                    <p className="mt-2 text-xl font-semibold">$12,924</p>
                    <p className="mt-1 text-xs text-slate-400">Under budget</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: FileText,
                title: 'Invoices, perfected',
                desc: 'Line items, statuses, payments, clients & notes. From draft to paid in seconds.',
              },
              {
                icon: Wallet,
                title: 'Budgets that guide',
                desc: 'Monthly / quarterly / yearly limits with progress bars and overspend alerts.',
              },
              {
                icon: TrendingUp,
                title: 'Insights that matter',
                desc: 'Revenue, expense breakdowns & cash flow — live charts powered by your data.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-5 text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="relative overflow-hidden rounded-[32px] bg-slate-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(190,242,100,0.15),transparent_50%),radial-gradient(circle_at_85%_80%,rgba(30,58,138,0.5),transparent_50%)]" />
            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-lime-300">Ready to ship?</p>
                <h2 className="mt-2 text-2xl font-semibold">Start invoicing in under a minute.</h2>
                <p className="mt-1 text-sm text-slate-300">Join founders using Invoice Atlas to stay on budget.</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-lime-200"
                >
                  Create account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Invoice Atlas • Osmo. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-lime-300" /> Slate • Lime • Emerald • Built for clarity
          </p>
        </div>
      </footer>
    </div>
  )
}
