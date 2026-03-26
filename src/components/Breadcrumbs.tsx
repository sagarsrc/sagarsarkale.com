'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  const crumbs = [
    { label: '~', href: '/' },
    ...segments.map((seg, i) => ({
      label: seg.replace(/-/g, ' '),
      href: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href}>
            {i > 0 && <span style={{ margin: '0 0.3em', color: 'var(--fg-muted)' }}>/</span>}
            {isLast ? (
              <span style={{ color: 'var(--fg-secondary)' }}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href}>{crumb.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
