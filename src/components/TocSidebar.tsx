'use client';

import { useState, useEffect } from 'react';
import type { TocEntry } from '@/lib/content';

export function TocSidebar({ entries, autonumber }: { entries: TocEntry[]; autonumber?: boolean }) {
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

  // Compute section numbers for autonumbered TOC
  const numberedEntries = autonumber
    ? entries.map((entry, i) => {
        if (entry.depth === 1) {
          const h1Index = entries.slice(0, i).filter(e => e.depth === 1).length + 1;
          return { ...entry, number: `${h1Index}.` };
        } else if (entry.depth === 2) {
          const prevH1 = [...entries.slice(0, i)].reverse().find(e => e.depth === 1);
          const h1Index = prevH1 ? entries.slice(0, i).filter(e => e.depth === 1).length : 0;
          const h2Index = entries.slice(0, i).filter(e => e.depth === 2 && (!prevH1 || entries.indexOf(e) > entries.indexOf(prevH1))).length + 1;
          return { ...entry, number: `${h1Index}.${h2Index}.` };
        } else if (entry.depth === 3) {
          const prevH1 = [...entries.slice(0, i)].reverse().find(e => e.depth === 1);
          const prevH2 = [...entries.slice(0, i)].reverse().find(e => e.depth === 2);
          const h1Index = prevH1 ? entries.slice(0, i).filter(e => e.depth === 1).length : 0;
          const h2Index = prevH2 ? entries.slice(0, entries.indexOf(prevH2) + 1).filter(e => e.depth === 2 && (!prevH1 || entries.indexOf(e) > entries.indexOf(prevH1))).length : 0;
          const h3Index = entries.slice(0, i).filter(e => e.depth === 3 && (!prevH2 || entries.indexOf(e) > entries.indexOf(prevH2))).length + 1;
          return { ...entry, number: `${h1Index}.${h2Index}.${h3Index}.` };
        }
        return { ...entry, number: undefined };
      })
    : entries.map(e => ({ ...e, number: undefined }));

  const filtered = numberedEntries.filter(e => e.depth <= 2);
  if (filtered.length === 0) return null;
  const minDepth = Math.min(...filtered.map(e => e.depth));

  // Group entries: h1s are top-level, h2s are children of the preceding h1
  const groups: { entry: TocEntry; children: TocEntry[] }[] = [];
  for (const entry of filtered) {
    if (entry.depth === minDepth) {
      groups.push({ entry, children: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].children.push(entry);
    }
  }

  // Determine which h1 group is active (contains the active heading)
  const activeGroupIndex = groups.findIndex(
    (g) => g.entry.id === activeId || g.children.some((c) => c.id === activeId)
  );

  return (
    <>
      {/* Desktop: fixed sidebar — only when viewport is wide enough */}
      <nav className="hidden min-[1500px]:block fixed right-8 top-24 w-56 max-h-[calc(100vh-8rem)] overflow-y-auto text-[0.75rem] leading-relaxed">
        <p className="font-semibold text-[var(--fg-secondary)] mb-3 uppercase tracking-wide text-[0.6875rem]" style={{ fontFamily: 'var(--font-mono)' }}>Contents</p>
        <ul className="list-none pl-0 space-y-1" style={{ fontFamily: 'var(--font-mono)' }}>
          {groups.map((group, gi) => {
            const isGroupActive = gi === activeGroupIndex;
            const isH1Active = activeId === group.entry.id;
            return (
              <li key={gi}>
                <a
                  href={`#${group.entry.id}`}
                  className={`block border-l-2 pl-3 py-0.5 no-underline transition-all duration-150 ${
                    isH1Active
                      ? 'border-[var(--accent)] text-[var(--fg)] font-medium'
                      : isGroupActive
                        ? 'border-[var(--accent)]/30 text-[var(--fg-secondary)]'
                        : 'border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]'
                  }`}
                >
                  {group.entry.text}
                </a>
                {/* Show children only when this group is active */}
                {isGroupActive && group.children.length > 0 && (
                  <ul className="list-none pl-3 mt-0.5 space-y-0.5">
                    {group.children.map((child, ci) => {
                      const isChildActive = activeId === child.id;
                      return (
                        <li key={ci}>
                          <a
                            href={`#${child.id}`}
                            className={`block border-l-2 pl-3 py-0.5 no-underline transition-all duration-150 text-[0.6875rem] ${
                              isChildActive
                                ? 'border-[var(--accent)] text-[var(--fg)] font-medium'
                                : 'border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]'
                            }`}
                          >
                            {child.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile + narrower desktops: collapsible at top */}
      <details className="min-[1500px]:hidden mb-6 text-[0.8125rem]" style={{ fontFamily: 'var(--font-mono)' }}>
        <summary className="cursor-pointer text-[var(--fg-secondary)] font-semibold uppercase tracking-wide text-[0.75rem]">
          Contents
        </summary>
        <ul className="list-none pl-2 mt-2 space-y-1">
          {filtered.map((entry, i) => (
            <li key={i} style={{ marginLeft: `${(entry.depth - minDepth) * 0.75}rem` }}>
              <a href={`#${entry.id}`} className="text-[var(--fg-muted)] no-underline hover:text-[var(--accent)]">
                {entry.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
