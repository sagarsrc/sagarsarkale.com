'use client';

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

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="mx-auto max-w-3xl px-5 flex justify-between items-center h-14">
        <div className="text-[0.8125rem] font-semibold lowercase tracking-tight shrink-0">
          <Link href="/">sagar sarkale</Link>
        </div>
        <nav className="flex items-center gap-5 max-sm:gap-3 text-[0.8125rem] max-sm:text-xs [&_a]:no-underline hover:[&_a]:text-[var(--accent)]">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
            return (
              <Link
                key={link.name}
                href={link.url}
                onClick={() => { if (isActive) window.scrollTo(0, 0); }}
                className={[
                  'pb-0.5 border-b whitespace-nowrap',
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
        <ReadingProgress />
      </div>
    </header>
  );
}
