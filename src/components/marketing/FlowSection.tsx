'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: '01', title: 'Create in seconds', desc: 'Line items, taxes, branding — a polished invoice in under a minute.' },
  { n: '02', title: 'Get paid faster', desc: 'One-click payments and reminders move money the moment work lands.' },
  { n: '03', title: 'Stay on budget', desc: 'Every payment flows into live budgets, forecasts, and reports.' },
];

/**
 * Money-flow interlude — dark cinematic pinned section.
 * Scroll scrub drives wallet → flying coins → paid invoice across 280vh.
 * Static final-state fallback when reduced motion is preferred.
 */
export default function FlowSection() {
  const outer = useRef<HTMLElement>(null);
  const wallet = useRef<HTMLDivElement>(null);
  const invoice = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const check = useRef<HTMLDivElement>(null);
  const coinRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const dx =
        (invoice.current?.getBoundingClientRect().left ?? 260) -
        (wallet.current?.getBoundingClientRect().left ?? 0);

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: outer.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
      });

      // Phase A — wallet arrives
      tl.fromTo(
        wallet.current,
        { scale: 0.6, opacity: 0, rotateY: -55 },
        { scale: 1, opacity: 1, rotateY: -12, duration: 1 },
        0
      );
      tl.fromTo(capRefs.current[0], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 0.1);

      // Phase B — coins fly wallet → invoice
      coinRefs.current.forEach((coin, i) => {
        if (!coin) return;
        const at = 1.0 + i * 0.09;
        tl.fromTo(coin, { x: 0, y: 0, opacity: 0 }, { opacity: 1, duration: 0.15 }, at);
        tl.to(coin, { x: dx, duration: 0.7 }, at + 0.1);
        tl.to(coin, { y: -64, duration: 0.35 }, at + 0.1);
        tl.to(coin, { y: 0, duration: 0.35 }, at + 0.45);
        tl.to(coin, { opacity: 0, scale: 0.4, duration: 0.15 }, at + 0.65);
      });
      tl.to(capRefs.current[0], { opacity: 0, y: -24, duration: 0.3 }, 1.0);
      tl.fromTo(capRefs.current[1], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 1.15);

      // Phase C — invoice assembles + PAID stamp
      tl.fromTo(
        invoice.current!.querySelectorAll('[data-flowbar]'),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5, stagger: 0.12 },
        2.1
      );
      tl.fromTo(
        check.current,
        { scale: 0, rotate: -30 },
        { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)' },
        2.5
      );
      tl.to(capRefs.current[1], { opacity: 0, y: -24, duration: 0.3 }, 2.2);
      tl.fromTo(capRefs.current[2], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 2.35);

      // Progress rail across the whole journey
      tl.fromTo(rail.current, { scaleX: 0 }, { scaleX: 1, duration: 3.1 }, 0);
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        tl.to(dot, { backgroundColor: '#bef264', boxShadow: '0 0 16px #bef264', duration: 0.1 }, 0.2 + i * 1.05);
      });

      ScrollTrigger.refresh();
    }, outer);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={outer} className="relative z-10 h-[280vh]" aria-label="How money flows">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(190,242,100,0.12),transparent_55%),radial-gradient(circle_at_85%_90%,rgba(30,58,138,0.5),transparent_55%)]" />

        <p className="relative text-xs font-semibold tracking-[0.35em] text-lime-300 uppercase">Money in motion</p>

        {/* Stage (decorative — story is carried by the captions below) */}
        <div aria-hidden className="relative mt-8 h-[240px] w-[320px] sm:h-[260px] sm:w-[460px]">
          {/* wallet */}
          <div ref={wallet} className="absolute top-1/2 left-0 w-32 -translate-y-1/2 sm:w-40" style={{ perspective: 600 }}>
            <div className="rounded-3xl border border-lime-300/40 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-2xl shadow-lime-300/10">
              <div className="h-8 w-11 rounded-md bg-gradient-to-br from-lime-300 to-emerald-400" />
              <p className="mt-4 text-[10px] tracking-[0.3em] text-slate-400">ATLAS WALLET</p>
              <p className="mt-1 font-mono text-sm text-slate-200">•• 4021</p>
            </div>
          </div>

          {/* coins */}
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              ref={(s) => {
                coinRefs.current[i] = s;
              }}
              style={{ top: `${44 + (i % 3) * 8}%` }}
              className="absolute left-[104px] h-4 w-4 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 shadow-lg shadow-amber-400/40 sm:left-[128px]"
            />
          ))}

          {/* invoice */}
          <div ref={invoice} className="absolute top-1/2 right-0 w-36 -translate-y-1/2 sm:w-44">
            <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-[0.2em] text-slate-600">INV-2026</p>
                <div ref={check} className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-[11px] font-bold text-slate-950">
                  ✓
                </div>
              </div>
              {[92, 70, 82, 55].map((w, i) => (
                <div key={i} data-flowbar className="mt-2 h-2 origin-left rounded-full bg-slate-200" style={{ width: `${w}%` }} />
              ))}
              <div data-flowbar className="mt-3 h-6 origin-left rounded-md bg-lime-300" />
            </div>
          </div>
        </div>

        {/* Step captions */}
        <div className="relative mt-6 h-28 w-full max-w-md px-6 text-center">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              ref={(d) => {
                capRefs.current[i] = d;
              }}
              className={`absolute inset-x-6 top-0 ${i > 0 ? 'opacity-0' : ''}`}
            >
              <p className="text-4xl font-bold text-white/15">{s.n}</p>
              <h3 className="-mt-3 text-xl font-semibold">{s.title}</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Progress rail */}
        <div className="relative mt-6 flex w-full max-w-md items-center gap-3 px-8">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              ref={(s) => {
                dotRefs.current[i] = s;
              }}
              className="h-2 w-2 shrink-0 rounded-full bg-slate-700"
            />
          ))}
          <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-slate-800">
            <div ref={rail} className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
