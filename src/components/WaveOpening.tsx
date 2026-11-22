'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function WaveOpening({ children }: { children: ReactNode }) {
  const opening = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = opening.current;
    if (!node) return;
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 431px)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!motion.matches) {
        node.style.removeProperty('--travel');
        return;
      }
      const distance = Math.max(1, node.clientWidth < 700 ? innerHeight * .42 : innerHeight * .55);
      const progress = Math.min(1, Math.max(0, -node.getBoundingClientRect().top / distance));
      node.style.setProperty('--travel', progress.toFixed(4));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={opening} className="landing-opening">{children}</div>;
}
