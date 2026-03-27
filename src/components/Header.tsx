'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { ReadingProgress } from './ReadingProgress';

const NAV_LINKS = [
  { name: 'blog', url: '/blog' },
  { name: 'work', url: '/work' },
  { name: 'random', url: '/random' },
  { name: 'about', url: '/about' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="relative flex justify-between items-center py-4 border-b border-[var(--border)] mb-8 sticky top-0 z-100 bg-[var(--bg)] -mx-5 px-5">
      <div className="text-[0.8125rem] font-semibold lowercase tracking-tight">
        <Link href="/">sagar sarkale</Link>
      </div>
      <nav className="flex items-center gap-5 max-sm:gap-3 text-[0.8125rem] max-sm:text-xs [&_a]:no-underline hover:[&_a]:text-[var(--accent)]">
        {NAV_LINKS.map(link => (
          <Link
            key={link.name}
            href={link.url}
            className={pathname === link.url || pathname.startsWith(link.url + '/') ? 'text-[var(--fg)] border-b border-[var(--accent)] pb-0.5' : 'text-[var(--fg-secondary)] border-b border-transparent pb-0.5'}
          >
            {link.name}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
      <ReadingProgress />
    </header>
  );
}
