'use client';

import { useState, useEffect } from 'react';
import type { TocEntry } from '@/lib/content';

export function TocSidebar({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observedEntries) => {
        for (const entry of observedEntries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    const headings = document.querySelectorAll('h1[id], h2[id], h3[id]');
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  // Only show h1 and h2
  const filtered = entries.filter(e => e.depth <= 2);
  if (filtered.length === 0) return null;
  const minDepth = Math.min(...filtered.map(e => e.depth));

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <nav className="hidden lg:block fixed right-8 top-24 w-56 max-h-[calc(100vh-8rem)] overflow-y-auto text-[0.75rem] leading-relaxed">
        <p className="font-semibold text-[var(--fg-secondary)] mb-3 uppercase tracking-wide text-[0.6875rem]" style={{ fontFamily: 'var(--font-mono)' }}>Contents</p>
        <ol className="list-decimal pl-4 space-y-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
          {filtered.map((entry, i) => (
            <li key={i} style={{ marginLeft: `${(entry.depth - minDepth) * 0.75}rem` }}>
              <a
                href={`#${entry.id}`}
                className={`no-underline transition-colors ${
                  activeId === entry.id
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]'
                }`}
              >
                {entry.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Mobile: collapsible at top */}
      <details className="lg:hidden mb-6 text-[0.8125rem]" style={{ fontFamily: 'var(--font-mono)' }}>
        <summary className="cursor-pointer text-[var(--fg-secondary)] font-semibold uppercase tracking-wide text-[0.75rem]">
          Contents
        </summary>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          {filtered.map((entry, i) => (
            <li key={i} style={{ marginLeft: `${(entry.depth - minDepth) * 0.75}rem` }}>
              <a href={`#${entry.id}`} className="text-[var(--fg-muted)] no-underline hover:text-[var(--accent)]">
                {entry.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}
