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

  // Close menu on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="mx-auto max-w-3xl px-5 flex justify-between items-center h-14 gap-4">
        {/* Site title */}
        <div className="text-[0.8125rem] font-semibold lowercase tracking-tight shrink-0 pb-0.5">
          <Link href="/">sagar sarkale</Link>
        </div>

        {/* Desktop nav */}
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

        {/* Mobile: hamburger + menu */}
        <div ref={menuRef} className="sm:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="bg-none border-none cursor-pointer p-1 text-[var(--fg)] leading-none"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </svg>
            )}
          </button>

          {/* Mobile dropdown */}
          {menuOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 top-14 bg-[var(--bg)]/80 backdrop-blur-sm z-40" onClick={() => setMenuOpen(false)} />
              {/* Menu */}
              <div className="absolute top-full right-0 mt-2 mr-4 w-48 bg-[var(--surface)] border border-[var(--code-border)] rounded-lg shadow-lg z-50 py-2">
                {NAV_LINKS.map(link => {
                  const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
                  return (
                    <Link
                      key={link.name}
                      href={link.url}
                      onClick={handleLinkClick}
                      className={[
                        'block px-4 py-2.5 text-sm no-underline transition-colors duration-150',
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
            </>
          )}
        </div>

        <ReadingProgress />
      </div>
    </header>
  );
}
