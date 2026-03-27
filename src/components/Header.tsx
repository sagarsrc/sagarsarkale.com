'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { name: 'blog', url: '/blog' },
  { name: 'work', url: '/work' },
  { name: 'random', url: '/random' },
  { name: 'about', url: '/about' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex justify-between items-center py-4 border-b border-[var(--border)] mb-8 sticky top-0 z-100 bg-[color-mix(in_srgb,var(--bg)_95%,transparent)] backdrop-blur-sm">
      <div className="text-[13px] font-semibold lowercase tracking-tight">
        <Link href="/">sagar sarkale</Link>
      </div>
      <nav className="flex items-center gap-5 max-sm:gap-3 text-[13px] max-sm:text-xs [&_a]:no-underline hover:[&_a]:text-[var(--accent)]">
        {NAV_LINKS.map(link => (
          <Link
            key={link.name}
            href={link.url}
            className={pathname === link.url || pathname.startsWith(link.url + '/') ? 'text-[var(--fg)]' : 'text-[var(--fg-secondary)]'}
          >
            {link.name}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
