'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

/**
 * Writes scroll progress through an element to `--p` (0..1) and, with `steps`,
 * the current step index to `data-step`. Progress runs from the element's top
 * reaching `start` of the viewport to its bottom reaching `end`.
 */
export function ScrollVar({
  as: Tag = 'div', className, id, children, start = 1, end = 0, steps,
}: {
  as?: ElementType; className?: string; id?: string; children: ReactNode;
  start?: number; end?: number; steps?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const from = vh * start;
      const to = vh * end;
      const span = Math.max(1, from - to + r.height);
      const p = Math.min(1, Math.max(0, (from - r.top) / span));
      node.style.setProperty('--p', p.toFixed(4));
      if (steps) node.dataset.step = String(Math.min(steps - 1, Math.floor(p * steps)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [start, end, steps]);
  return <Tag ref={ref} className={className} id={id}>{children}</Tag>;
}

/** Adds `is-in` once the element enters the viewport. Content is visible without JS. */
export function Reveal({
  as: Tag = 'div', className, children, delay = 0,
}: { as?: ElementType; className?: string; children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) { node.classList.add('is-in'); return; }
    node.classList.add('is-armed');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { node.classList.add('is-in'); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal${className ? ' ' + className : ''}`} style={delay ? { '--d': `${delay}ms` } as React.CSSProperties : undefined}>
      {children}
    </Tag>
  );
}

/** Counts up to `value` when scrolled into view; renders the final value on the server. */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '' }: {
  value: number; decimals?: number; prefix?: string; suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    setN(0);
    let frame = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / 1400);
        setN(value * (1 - Math.pow(1 - k, 4)));
        if (k < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { rootMargin: '0px 0px -12% 0px' });
    io.observe(node);
    return () => { io.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={ref}>{prefix}{n.toFixed(decimals)}{suffix}</span>;
}
