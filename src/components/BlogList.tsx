'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';

interface BlogPost {
  path: string;
  frontmatter: {
    title: string;
    summary?: string;
    date?: string;
    tags?: string[];
  };
  readingTime: string;
  coverImage?: string;
}

interface Props {
  posts: BlogPost[];
  tags: string[];
}

export function BlogList({ posts, tags }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? posts.filter((p) => p.frontmatter.tags?.includes(activeTag))
    : posts;

  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Post list */}
      <div className="flex flex-col gap-3">
        {/* Featured card */}
        {featured && (
          <Link
            href={featured.path}
            className="block border border-[var(--code-border)] rounded-lg no-underline text-inherit transition-[border-color,background] duration-200 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--code-border)_15%,transparent)] overflow-hidden"
          >
            {featured.coverImage && (
              <div className="w-full h-40 overflow-hidden">
                <img
                  src={featured.coverImage}
                  alt={featured.frontmatter.title}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
            )}
            <div className="p-3">
              <h2 className="text-base font-semibold leading-snug mb-0.5 text-[var(--fg)]">
                {featured.frontmatter.title}
              </h2>
              {featured.frontmatter.summary && (
                <p className="text-xs text-[var(--fg-secondary)] leading-snug mb-0.5 line-clamp-2">
                  {featured.frontmatter.summary}
                </p>
              )}
              <div className="flex gap-3 text-xs text-[var(--fg-muted)]">
                <span>{featured.readingTime}</span>
                {featured.frontmatter.date && (
                  <span>{formatDate(featured.frontmatter.date)}</span>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Regular cards */}
        {rest.map((post) => (
          <Link
            key={post.path}
            href={post.path}
            className="flex items-center gap-3 p-2 border border-[var(--code-border)] rounded-lg no-underline text-inherit transition-[border-color,background] duration-200 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--code-border)_15%,transparent)]"
          >
            {post.coverImage && (
              <div className="flex-[0_0_100px] w-[100px] h-[68px] max-sm:flex-[0_0_72px] max-sm:w-[72px] max-sm:h-[50px] rounded overflow-hidden bg-[var(--code-background)]">
                <img
                  src={post.coverImage}
                  alt={post.frontmatter.title}
                  loading="lazy"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold leading-snug mb-0.5 text-[var(--fg)]">
                {post.frontmatter.title}
              </h2>
              {post.frontmatter.summary && (
                <p className="text-xs text-[var(--fg-secondary)] leading-snug mb-0.5 line-clamp-2">
                  {post.frontmatter.summary}
                </p>
              )}
              <div className="flex gap-3 text-xs text-[var(--fg-muted)]">
                <span>{post.readingTime}</span>
                {post.frontmatter.date && (
                  <span>{formatDate(post.frontmatter.date)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function FilterPill({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        whitespace-nowrap shrink-0 cursor-pointer
        rounded-full border
        transition-all duration-150
        text-[11px] sm:text-[13px]
        px-2.5 py-1 sm:px-3.5 sm:py-1.5
        ${isActive
          ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)] font-medium'
          : 'border-[var(--border)] bg-transparent text-[var(--fg-muted)] hover:border-[var(--fg-secondary)] hover:text-[var(--fg-secondary)]'
        }
      `}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {isActive && <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mr-1.5 align-middle" />}
      {label}
    </button>
  );
}
