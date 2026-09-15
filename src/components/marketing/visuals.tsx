'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function onEnter(el: HTMLElement | null, fn: () => void) {
  if (!el) return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const ctx = gsap.context(() => {
    fn();
  });
  return () => ctx.revert();
}

/** Live mini bar chart for the Invoices bento card. */
export function BarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const bars = [34, 58, 44, 78, 62, 92, 70];
  useLayoutEffect(
    () =>
      onEnter(ref.current, () => {
        gsap.fromTo(
          ref.current!.querySelectorAll('[data-bar]'),
          { scaleY: 0.04 },
          { scaleY: 1, duration: 0.8, stagger: 0.09, ease: 'back.out(1.6)', scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } }
        );
      }),
    []
  );
  return (
    <div ref={ref} className="flex h-24 items-end gap-1.5" aria-hidden>
      {bars.map((h, i) => (
        <div
          key={i}
          data-bar
          style={{ height: `${h}%` }}
          className={`w-full origin-bottom rounded-t-md ${i === 5 ? 'bg-lime-400' : 'bg-slate-900/85'}`}
        />
      ))}
    </div>
  );
}

/** Animated budget ring for the Budgets bento card. */
export function BudgetRing() {
  const ref = useRef<HTMLDivElement>(null);
  const R = 52;
  const C = 2 * Math.PI * R;
  useLayoutEffect(
    () =>
      onEnter(ref.current, () => {
        gsap.fromTo(
          ref.current!.querySelector('[data-ring]'),
          { strokeDashoffset: C },
          {
            strokeDashoffset: C * (1 - 0.86),
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
          }
        );
      }),
    [C]
  );
  return (
    <div ref={ref} className="relative h-[120px] w-[120px]" aria-hidden>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          data-ring
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="#a3e635"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold text-slate-900">86%</span>
        <span className="text-[10px] tracking-[0.2em] text-slate-500 uppercase">paid</span>
      </div>
    </div>
  );
}

/** Cash-flow sparkline that draws itself on scroll into view. */
export function Sparkline() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () =>
      onEnter(ref.current, () => {
        gsap.fromTo(
          ref.current!.querySelector('[data-line]'),
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: 'power2.inOut',
            scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
          }
        );
        gsap.fromTo(
          ref.current!.querySelector('[data-area]'),
          { opacity: 0 },
          { opacity: 1, duration: 1, delay: 0.8, scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } }
        );
      }),
    []
  );
  return (
    <div ref={ref} aria-hidden>
      <svg viewBox="0 0 260 90" className="h-[90px] w-full">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bef264" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#bef264" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path data-area d="M0,70 C30,68 45,50 70,52 C95,54 105,30 135,32 C165,34 175,55 205,48 C230,43 245,25 260,22 L260,90 L0,90 Z" fill="url(#spark-fill)" opacity="0" />
        <path
          data-line
          d="M0,70 C30,68 45,50 70,52 C95,54 105,30 135,32 C165,34 175,55 205,48 C230,43 245,25 260,22"
          fill="none"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
        />
        <circle cx="260" cy="22" r="5" fill="#a3e635" stroke="#0f172a" strokeWidth="2" />
      </svg>
    </div>
  );
}
