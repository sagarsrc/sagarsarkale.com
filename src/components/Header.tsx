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

          {/* Mobile */}
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

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-[100] bg-[var(--bg)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between h-14 px-5 border-b border-[var(--border)] shrink-0">
            <span className="text-[0.8125rem] font-semibold lowercase tracking-tight">sagar sarkale</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="px-3 py-1 text-sm rounded-full border border-[var(--fg)] text-[var(--fg)]"
                style={{ background: 'none' }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Links */}
          <nav className="flex-1 flex flex-col justify-center px-5">
            {NAV_LINKS.map((link, i) => {
              const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
              return (
                <div key={link.name}>
                  {i > 0 && <div className="border-t border-[var(--border)]" />}
                  <Link
                    href={link.url}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      'block py-5 text-2xl no-underline font-medium tracking-tight',
                      isActive
                        ? 'text-[var(--accent)]'
                        : link.highlight
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--fg)]',
                    ].join(' ')}
                  >
                    {link.name}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
