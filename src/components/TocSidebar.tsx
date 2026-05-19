'use client';

import { useState, useEffect } from 'react';
import type { TocEntry } from '@/lib/content';

interface Props {
  entries: TocEntry[];
  autonumber?: boolean;
}

function computeNumbers(entries: TocEntry[]): (TocEntry & { num?: string })[] {
  let h1 = 0, h2 = 0, h3 = 0;
  return entries.map((e) => {
    if (e.depth === 1) { h1++; h2 = 0; h3 = 0; return { ...e, num: `${h1}.` }; }
    if (e.depth === 2) { h2++; h3 = 0; return { ...e, num: `${h1}.${h2}.` }; }
    if (e.depth === 3) { h3++; return { ...e, num: `${h1}.${h2}.${h3}.` }; }
    return { ...e };
  });
}

export function TocSidebar({ entries, autonumber }: Props) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observedEntries) => {
        for (const entry of observedEntries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );
    document.querySelectorAll('h1[id], h2[id], h3[id]').forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  type NumEntry = TocEntry & { num?: string };
  const withNum: NumEntry[] = autonumber ? computeNumbers(entries) : entries.map((e) => ({ ...e }));
  const filtered = withNum.filter((e) => e.depth <= 2);
  if (filtered.length === 0) return null;

  const minDepth = Math.min(...filtered.map((e) => e.depth));

  const groups: { entry: NumEntry; children: NumEntry[] }[] = [];
  for (const entry of filtered) {
    if (entry.depth === minDepth) groups.push({ entry, children: [] });
    else if (groups.length > 0) groups[groups.length - 1].children.push(entry);
  }

  const activeGroupIndex = groups.findIndex(
    (g) => g.entry.id === activeId || g.children.some((c) => c.id === activeId)
  );

  const fmt = (e: NumEntry) =>
    e.num ? `${e.num}\u00a0\u00a0${e.text}` : e.text;

  return (
    <>
      {/* Desktop sidebar */}
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
                  {fmt(group.entry)}
                </a>
                {isGroupActive && group.children.length > 0 && (
                  <ul className="list-none pl-3 mt-0.5 space-y-0.5">
                    {group.children.map((child) => {
                      const isChildActive = activeId === child.id;
                      return (
                        <li key={child.id}>
                          <a
                            href={`#${child.id}`}
                            className={`block border-l-2 pl-3 py-0.5 no-underline transition-all duration-150 text-[0.6875rem] ${
                              isChildActive
                                ? 'border-[var(--accent)] text-[var(--fg)] font-medium'
                                : 'border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]'
                            }`}
                          >
                            {fmt(child)}
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

      {/* Mobile collapsible */}
      <details className="min-[1500px]:hidden mb-6 text-[0.8125rem]" style={{ fontFamily: 'var(--font-mono)' }}>
        <summary className="cursor-pointer text-[var(--fg-secondary)] font-semibold uppercase tracking-wide text-[0.75rem]">
          Contents
        </summary>
        <ul className="list-none pl-2 mt-2 space-y-1">
          {filtered.map((entry, i) => (
            <li key={entry.id + i} style={{ marginLeft: `${(entry.depth - minDepth) * 0.75}rem` }}>
              <a href={`#${entry.id}`} className="text-[var(--fg-muted)] no-underline hover:text-[var(--accent)]">
                {fmt(entry)}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
