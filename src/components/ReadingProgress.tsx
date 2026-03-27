'use client';

import { useState, useEffect } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const scrolled = window.scrollY - articleTop;
      const viewportHeight = window.innerHeight;
      const pct = Math.min(100, Math.max(0, (scrolled / (articleHeight - viewportHeight)) * 100));
      setProgress(pct);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-[var(--accent)] transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1, transition: 'width 100ms ease-out, opacity 300ms ease-out' }}
      />
    </div>
  );
}
