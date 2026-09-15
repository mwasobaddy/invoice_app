import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Wallet, TrendingUp, ArrowRight, ShieldCheck, Zap, BarChart3, Star } from "lucide-react";
import HomeScene from "@/components/home-3d/HomeScene";
import GiantType from "@/components/home-3d/GiantType";
import { Counter, Magnetic, Marquee, Reveal, Tilt } from "@/components/marketing/anim";
import { BarChart, BudgetRing, Sparkline } from "@/components/marketing/visuals";
import FlowSection from "@/components/marketing/FlowSection";

export const metadata = {
  title: "Invoice Atlas — Manage invoices, track budgets",
  description: "Premium invoice manager for modern teams. Create invoices, record payments, and keep budgets on track.",
};

const CUSTOMERS = ["Northwind", "Acme Co", "Lumen Labs", "Hexagon", "Brightline", "Corelink", "Foundry", "Moonshot"];

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed full-page 3D scroll journey (z-0, behind content) */}
      <HomeScene />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-900">Invoice Atlas</span>
            <span className="hidden rounded-full bg-lime-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 sm:inline-flex">
              Osmo
            </span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Primary">
            <Link
              href="/auth/signin"
              className="hidden rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — owns the giant type + 3D wallet, content sits above (isolated, no overlap) */}
      <main>
        <section className="relative isolate min-h-[100svh] overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/30 to-slate-50/85" />
          <GiantType />
          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                  <span role="status">Live metrics • Trusted by founders</span>
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Manage invoices,
                  <span className="block text-slate-500">track budgets.</span>
                  <span className="block">In one Atlas.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-4 max-w-xl text-[15px] leading-6 text-slate-600">
                  The premium invoice manager for modern teams. Create invoices with line items, record payments, and keep budgets on track — all with a calm, slate &amp; lime system built for clarity.
                </p>
              </Reveal>

              <Reveal delay={0.24}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Magnetic>
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
                    >
                      Start for free <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Magnetic>
                  <Magnetic>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                    >
                      Sign in
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>

              <Reveal delay={0.32}>
                <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden /> Secure by design
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-slate-400" aria-hidden /> No credit card
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-slate-400" aria-hidden /> Real-time
                  </span>
                </div>
              </Reveal>

              <div className="mt-10 hidden items-center gap-3 lg:flex" aria-hidden>
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Scroll</span>
                <span className="relative h-px w-16 overflow-hidden bg-slate-200">
                  <span className="absolute inset-y-0 left-0 w-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-lime-400" />
                </span>
              </div>
            </div>

            {/* Right preview — brand-matched dark card like auth pages */}
            <Reveal delay={0.35} y={44}>
              <Tilt className="relative">
                <div className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/30 sm:p-8" aria-hidden>
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
              </Tilt>
            </Reveal>
          </div>
          </div>
        </section>

        {/* Trust marquee */}
        <section className="relative z-10 border-y border-slate-200/70 bg-white/70 py-5 backdrop-blur" aria-label="Trusted by modern teams">
          <Marquee items={CUSTOMERS} />
        </section>

        {/* Metrics band */}
        <section className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="metrics-heading">
          <Reveal>
            <h2 id="metrics-heading" className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Atlas in numbers
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { end: 12480, suffix: '', label: 'invoices paid', decimals: 0 },
              { end: 86, suffix: '%', label: 'paid on time', decimals: 0 },
              { end: 4.9, suffix: '/5', label: 'founder rating', decimals: 1 },
              { end: 58, prefix: '<', suffix: 's', label: 'median setup', decimals: 0 },
            ].map((m, i) => (
              <Reveal key={m.label} delay={i * 0.08}>
                <div className="rounded-3xl border border-slate-200/70 bg-white p-6 text-center shadow-sm">
                  <p className="text-3xl font-semibold tracking-tight text-slate-900">
                    <Counter end={m.end} decimals={m.decimals} prefix={m.prefix ?? ''} suffix={m.suffix} />
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{m.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features bento */}
        <section className="relative z-10 mx-auto max-w-6xl px-4 pb-10 sm:px-6" aria-labelledby="features-heading">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime-600">The toolkit</p>
              <h2 id="features-heading" className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Everything money needs, nothing it doesn&apos;t.
              </h2>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Reveal delay={0}>
              <div className="h-full rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <FileText className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">Invoices, perfected</h3>
                <p className="mt-1.5 text-sm leading-5 text-slate-600">Line items, statuses, payments, clients &amp; notes. From draft to paid in seconds.</p>
                <div className="mt-5"><BarChart /></div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Wallet className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">Budgets that guide</h3>
                <p className="mt-1.5 text-sm leading-5 text-slate-600">Monthly / quarterly / yearly limits with progress bars and overspend alerts.</p>
                <div className="mt-5 flex justify-center"><BudgetRing /></div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="h-full rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <TrendingUp className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">Insights that matter</h3>
                <p className="mt-1.5 text-sm leading-5 text-slate-600">Revenue, expense breakdowns &amp; cash flow — live charts powered by your data.</p>
                <div className="mt-5"><Sparkline /></div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Money-flow interlude */}
        <FlowSection />

        {/* Testimonial */}
        <section className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center sm:px-6" aria-labelledby="love-heading">
          <Reveal>
            <div className="flex items-center justify-center gap-1" role="img" aria-label="Rated 5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              ))}
            </div>
            <h2 id="love-heading" className="sr-only">Loved by founders</h2>
            <blockquote className="mt-6 text-2xl font-medium leading-snug tracking-tight text-slate-900 sm:text-3xl">
              “Invoice Atlas took us from spreadsheet chaos to paid in days. It pays for itself every single week.”
            </blockquote>
            <p className="mt-4 text-sm font-semibold text-slate-700">Amara Osei <span className="font-normal text-slate-500">— Founder, Lumen Labs</span></p>
          </Reveal>
        </section>

        {/* Bottom CTA */}
        <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="cta-heading">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] bg-slate-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(190,242,100,0.15),transparent_50%),radial-gradient(circle_at_85%_80%,rgba(30,58,138,0.5),transparent_50%)]" />
              <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-lime-300">Ready to ship?</p>
                  <h2 id="cta-heading" className="mt-2 text-2xl font-semibold">Start invoicing in under a minute.</h2>
                  <p className="mt-1 text-sm text-slate-300">Join founders using Invoice Atlas to stay on budget.</p>
                </div>
                <div className="flex gap-3">
                  <Magnetic>
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      Create account <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Magnetic>
                  <Magnetic>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      Sign in
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200/60 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Invoice Atlas • Osmo. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-lime-300" aria-hidden /> Slate • Lime • Emerald • Built for clarity
          </p>
        </div>
      </footer>
    </div>
  );
}
