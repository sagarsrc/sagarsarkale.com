'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { ReadingProgress } from './ReadingProgress';

const NAV_LINKS = [
  { name: 'agents.md', url: '/agents', highlight: true },
  { name: 'blog', url: '/blog' },
  { name: 'work', url: '/work' },
  { name: 'random', url: '/random' },
  { name: 'about', url: '/about' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="mx-auto max-w-3xl px-5 flex justify-between items-center h-14 gap-4 relative">
        <div className="text-[0.8125rem] font-semibold lowercase tracking-tight shrink-0 pb-0.5">
          <Link href="/">sagar sarkale</Link>
        </div>

        {/* Desktop */}
        <nav className="hidden sm:flex items-center gap-5 text-[0.8125rem] [&_a]:no-underline hover:[&_a]:text-[var(--accent)]">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
            return (
              <Link
                key={link.name}
                href={link.url}
                onClick={() => { if (isActive) window.scrollTo(0, 0); }}
                className={[
                  'pb-0.5 border-b whitespace-nowrap transition-colors duration-150',
                  isActive
                    ? 'text-[var(--fg)] border-[var(--accent)]'
                    : link.highlight
                      ? 'text-[var(--accent)] border-transparent'
                      : 'text-[var(--fg-secondary)] border-transparent',
                ].join(' ')}
              >
                {link.name}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>

        {/* Mobile */}
        <div ref={menuRef} className="sm:hidden relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="p-2 -mr-2 text-[var(--fg)]"
            style={{ background: 'none', border: 'none' }}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </svg>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface)] border border-[var(--code-border)] rounded-lg shadow-xl py-1.5 z-50">
              {NAV_LINKS.map(link => {
                const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
                return (
                  <Link
                    key={link.name}
                    href={link.url}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      'block px-4 py-2 text-sm no-underline transition-colors',
                      isActive
                        ? 'text-[var(--accent)] font-medium'
                        : link.highlight
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]',
                    ].join(' ')}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <ReadingProgress />
      </div>
    </header>
  );
}
