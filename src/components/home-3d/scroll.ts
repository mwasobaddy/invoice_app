import { useEffect, useRef } from 'react';

/** Smoothstep helper (0..1 easing). */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Shared mutable scroll progress (0..1), rAF-throttled, no re-renders. */
export function useScrollProgress() {
  const ref = useRef(0);
  useEffect(() => {
    let raf = 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      ref.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

/** Shared pointer position (-1..1), disabled on coarse pointers. */
export function usePointer() {
  const ref = useRef({ x: 0, y: 0, active: false });
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const onMove = (e: PointerEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      ref.current.active = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return ref;
}

export function usePrefersReducedMotion() {
  const ref = useRef(false);
  useEffect(() => {
    ref.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  return ref;
}
