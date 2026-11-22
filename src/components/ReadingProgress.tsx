'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function ReadingProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const distance = root.scrollHeight - root.clientHeight;
      const fraction = distance > 0 ? window.scrollY / distance : 0;
      setProgress(Math.min(1, Math.max(0, fraction)));
    };

    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  // The homepage is a scroll story, not an article; it has no reading progress.
  if (pathname === '/') return null;

  return (
    <div
      className="absolute inset-x-0 bottom-0 h-[2px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full origin-left bg-[var(--accent)]"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
