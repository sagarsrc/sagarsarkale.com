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
      {/* Tag filter pills */}
      <div className="flex flex-wrap gap-2 mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
        {[null, ...tags].map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag ?? '__all'}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              style={{
                padding: '4px 12px',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--code-border)'}`,
                color: isActive ? 'var(--accent)' : 'var(--fg-muted)',
                backgroundColor: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                cursor: 'pointer',
                transition: 'border-color 150ms, color 150ms, background-color 150ms',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--fg-secondary)';
                  e.currentTarget.style.color = 'var(--fg-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--code-border)';
                  e.currentTarget.style.color = 'var(--fg-muted)';
                }
              }}
            >
              {tag ?? 'All'}
            </button>
          );
        })}
      </div>

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
