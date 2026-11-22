'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Homepage scroll choreography.
 * - Smooth, eased wheel scrolling (Lenis); touch keeps native scrolling.
 * - `.stack` sections stick under the header and the next one slides over.
 *   A section taller than the screen scrolls through first, then sticks.
 * - The covered section sinks back under a darkening shade. It is not scaled:
 *   shrinking it would expose the section behind it as strips along its edges.
 * - A sliding sheet has rounded top corners that flatten as it docks (--arrive),
 *   so no corner wedge of the section underneath shows once it is in place.
 * - `[data-parallax]` elements drift against the scroll by their factor.
 * Reduced motion keeps native scrolling, the stacking, and drops the movement.
 */
export function ScrollStage() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('header');
    const headerH = () => (header ? header.getBoundingClientRect().height : 0);

    const lenis = reduced ? null : new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      anchors: { offset: -56 },
    });

    let frame = 0;
    let tops: number[] = [];
    const panels = () => Array.from(document.querySelectorAll<HTMLElement>('.stack'));

    const measure = () => {
      const vh = window.innerHeight;
      const h = headerH();
      tops = panels().map((el) => {
        const top = Math.min(h, vh - el.offsetHeight);
        el.style.top = `${top}px`;
        return top;
      });
    };

    const update = () => {
      const vh = window.innerHeight;
      const h = headerH();
      const list = panels();
      list.forEach((el, i) => {
        // 0 while the sheet slides up, 1 once it docks: corners flatten as it lands.
        const dock = el.getBoundingClientRect().top - (tops[i] ?? h);
        const arrive = Math.min(1, Math.max(0, 1 - dock / (vh * 0.35)));
        el.style.setProperty('--arrive', arrive.toFixed(3));
        const next = list[i + 1] ?? (el.nextElementSibling as HTMLElement | null);
        if (!next) return;
        const nextTop = next.getBoundingClientRect().top;
        const k = Math.min(1, Math.max(0, 1 - (nextTop - h) / Math.max(1, vh - h)));
        el.style.setProperty('--cover', k.toFixed(3));
      });
      const close = document.querySelector<HTMLElement>('.landing-close');
      if (close) {
        const dock = close.getBoundingClientRect().top - h;
        close.style.setProperty('--arrive', Math.min(1, Math.max(0, 1 - dock / (vh * 0.35))).toFixed(3));
      }
      if (!reduced) {
        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          // Measure the untransformed parent so the offset never feeds back on itself.
          const r = (el.parentElement ?? el).getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const speed = parseFloat(el.dataset.parallax || '0');
          const offset = (r.top + r.height / 2 - vh / 2) * speed;
          el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        });
      }
    };

    let lastHeader = -1;
    const tick = (time: number) => {
      lenis?.raf(time);
      const hh = headerH();
      if (hh !== lastHeader) { lastHeader = hh; measure(); }
      update();
      frame = requestAnimationFrame(tick);
    };

    measure();
    update();
    frame = requestAnimationFrame(tick);
    const ro = new ResizeObserver(() => { measure(); update(); });
    panels().forEach((el) => ro.observe(el));
    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      lenis?.destroy();
      panels().forEach((el) => { el.style.top = ''; });
    };
  }, []);

  return null;
}
