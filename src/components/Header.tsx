'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { name: 'home', url: '/' },
  { name: 'blog', url: '/blog' },
  { name: 'work', url: '/work' },
  { name: 'random', url: '/random' },
  { name: 'about', url: '/about' },
];

export function Header() {
  return (
    <div className="header">
      <h1 className="header-title">
        <Link href="/" style={{ textDecoration: 'none' }}>
          Sagar Sarkale
        </Link>
      </h1>
      <nav className="header-nav" style={{ marginTop: 'var(--header-menu-top-gap)' }}>
        {NAV_LINKS.map(link => (
          <span key={link.name} className="header-nav-item">
            <Link href={link.url}>/{link.name}</Link>
          </span>
        ))}
        <ThemeToggle />
      </nav>
    </div>
  );
}
