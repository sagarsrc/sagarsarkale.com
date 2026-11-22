'use client';

import { useEffect } from 'react';

/**
 * Homepage scroll choreography.
 * - Native scrolling (as Apple's sites do): effects follow the scroll position
 *   every frame instead of easing the scroll itself, so nothing lags the hand.
 * - `.stack` sections stick under the header and the next one slides over.
 *   A section taller than the screen scrolls through first, then sticks.
 * - The covered section sinks back under a darkening shade. It is not scaled:
 *   shrinking it would expose the section behind it as strips along its edges.
 * - A sliding sheet has rounded top corners that flatten as it docks (--arrive),
 *   so no corner wedge of the section underneath shows once it is in place.
 * - `[data-parallax]` elements drift against the scroll by their factor.
 * - Each wheel, trackpad or swipe gesture glides to the next card
 *   (`.snap-point` markers); cards taller than the screen advance a screen at a
 *   time, then stop where their bottom meets the screen.
 * Reduced motion keeps native scrolling, the stacking, and drops the movement.
 */
export function ScrollStage() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('header');
    const headerH = () => (header ? header.getBoundingClientRect().height : 0);


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
    const tick = () => {
      const hh = headerH();
      if (hh !== lastHeader) { lastHeader = hh; measure(); }
      update();
      frame = requestAnimationFrame(tick);
    };

    // ----- One gesture, one card -----
    let animating = false;
    let lockUntil = 0;
    const stops = () => {
      const vh = window.innerHeight;
      // The header shrinks by half a rem (8px) once scrolled; aim for that height.
      const pad = header?.classList.contains('site-header--scrolled') ? headerH() : headerH() - 8;
      const max = document.documentElement.scrollHeight - vh;
      const marks = Array.from(document.querySelectorAll<HTMLElement>('.snap-point'))
        .map((el) => Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - pad)));
      marks.push(max);
      marks.sort((a, b) => a - b);
      const out: number[] = [];
      marks.forEach((m, i) => {
        out.push(m);
        const next = marks[i + 1];
        // A card taller than the screen: stop every ~85% of a screen inside it,
        // and last where its bottom meets the screen, before the next card slides in.
        // Not in the opening, where the intro sliding over the wave is one move.
        if (next !== undefined && i > 0) {
          const last = next + pad - vh;
          for (let y = m + vh * 0.85; y < last - vh * 0.2; y += vh * 0.85) out.push(Math.round(y));
          if (last > m + vh * 0.25) out.push(Math.round(last));
        }
      });
      out.sort((a, b) => a - b);
      return out.filter((y, i, a) => y <= max && (i === 0 || y - a[i - 1] > 4));
    };
    const glide = (to: number) => {
      const from = window.scrollY;
      const dist = to - from;
      const dur = Math.min(1000, 520 + Math.abs(dist) * 0.25);
      const t0 = performance.now();
      animating = true;
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const stepGlide = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        window.scrollTo({ top: from + dist * ease(k), behavior: 'instant' });
        if (k < 1) { requestAnimationFrame(stepGlide); return; }
        // Layout can shift a little as the opening moves; settle on the true stop.
        const y = window.scrollY;
        const near = stops().reduce((best, v) => (Math.abs(v - y) < Math.abs(best - y) ? v : best), y);
        if (Math.abs(near - y) > 1 && Math.abs(near - y) < 120) window.scrollTo({ top: near, behavior: 'instant' });
        animating = false;
        lockUntil = performance.now() + 380;
      };
      requestAnimationFrame(stepGlide);
    };
    const advance = (down: boolean) => {
      const y = window.scrollY;
      const list = stops();
      const target = down ? list.find((s) => s > y + 4) : [...list].reverse().find((s) => s < y - 4);
      if (target !== undefined) glide(target);
    };
    const busy = () => animating || performance.now() < lockUntil;
    const onWheel = (e: WheelEvent) => {
      if (reduced || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      // Swallow the rest of the gesture (trackpad momentum) while gliding.
      if (busy()) { lockUntil = Math.max(lockUntil, performance.now() + 120); return; }
      if (Math.abs(e.deltaY) >= 3) advance(e.deltaY > 0);
    };
    // Touch: a vertical swipe moves one card; native scrolling is held so the
    // page never rests between cards. Horizontal swipes and pinches pass through.
    let touchY = 0;
    let touchX = 0;
    let swiped = false;
    const inMenu = (t: EventTarget | null) => t instanceof Element && !!t.closest('[role="dialog"], .fixed.inset-0');
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
      swiped = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (reduced || e.touches.length !== 1 || inMenu(e.target)) return;
      const dy = touchY - e.touches[0].clientY;
      const dx = touchX - e.touches[0].clientX;
      if (Math.abs(dy) < Math.abs(dx)) return;
      e.preventDefault();
      if (!swiped && !busy() && Math.abs(dy) > 36) { swiped = true; advance(dy > 0); }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });


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
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      panels().forEach((el) => { el.style.top = ''; });
    };
  }, []);

  return null;
}
