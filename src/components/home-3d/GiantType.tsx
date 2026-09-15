'use client';

import { useEffect, useRef } from 'react';

/**
 * GiantType — oversized display typography sandwich layer.
 * Sits ABOVE the 3D canvas but BELOW the content: hollow outlined
 * letterforms let the floating wallet show through, exactly like
 * product-through-type compositions. Drifts + fades on scroll.
 */
export default function GiantType() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      if (!ref.current) return;
      const y = Math.min(window.scrollY, 900);
      ref.current.style.transform = `translate3d(0, ${y * 0.14}px, 0)`;
      ref.current.style.opacity = String(Math.max(0, 1 - y / 750));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] flex select-none flex-col items-center justify-center overflow-hidden pt-[10vh]"
    >
      <span className="text-center text-[19vw] font-bold leading-[0.82] tracking-tight text-transparent opacity-80 [-webkit-text-stroke:2px_#cbd5e1] lg:text-[15vw]">
        INVOICE
      </span>
      <span className="bg-gradient-to-b from-lime-400/80 to-slate-300/60 bg-clip-text text-center text-[19vw] font-bold leading-[0.82] tracking-tight text-transparent lg:text-[15vw]">
        ATLAS
      </span>
    </div>
  );
}
