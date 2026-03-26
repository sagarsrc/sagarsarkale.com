'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { name: 'blog', url: '/blog' },
  { name: 'work', url: '/work' },
  { name: 'random', url: '/random' },
  { name: 'about', url: '/about' },
];

export function Header() {
  return (
    <header className="header">
      <div className="header-name">
        <Link href="/">sagar sarkale</Link>
      </div>
      <nav className="header-nav">
        {NAV_LINKS.map(link => (
          <Link key={link.name} href={link.url}>{link.name}</Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
