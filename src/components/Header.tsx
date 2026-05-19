'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-5 flex justify-between items-center h-14 gap-4">
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

          {/* Mobile controls */}
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="p-2 -mr-2 text-[var(--fg)]"
              style={{ background: 'none', border: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </svg>
            </button>
          </div>

          <ReadingProgress />
        </div>
      </header>

      {/* Mobile slide-in drawer */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[260px] max-w-[80vw] bg-[var(--bg)] border-l border-[var(--border)] shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between h-14 px-5 border-b border-[var(--border)] shrink-0">
              <span className="text-[0.8125rem] font-semibold lowercase tracking-tight">menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2 text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors"
                style={{ background: 'none', border: 'none' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="3" y1="3" x2="15" y2="15" />
                  <line x1="15" y1="3" x2="3" y2="15" />
                </svg>
              </button>
            </div>
            {/* Links */}
            <nav className="flex-1 py-2">
              {NAV_LINKS.map(link => {
                const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
                return (
                  <Link
                    key={link.name}
                    href={link.url}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      'flex items-center px-5 py-3 text-[15px] no-underline transition-colors duration-150',
                      isActive
                        ? 'text-[var(--accent)] font-medium'
                        : link.highlight
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]',
                    ].join(' ')}
                  >
                    {isActive && <span className="w-1 h-1 rounded-full bg-[var(--accent)] mr-3 shrink-0" />}
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
