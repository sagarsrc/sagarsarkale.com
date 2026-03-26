'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const parentPath = segments.length > 1
    ? '/' + segments.slice(0, -1).join('/')
    : '/';

  return (
    <Link
      href={parentPath}
      className="text-xs text-[var(--fg-secondary)] no-underline hover:text-[var(--accent)] transition-colors"
    >
      &larr; back
    </Link>
  );
}
