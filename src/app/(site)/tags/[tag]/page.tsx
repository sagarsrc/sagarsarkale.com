import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.frontmatter.tags || []) {
      tags.add(tag);
    }
  }
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag}` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getAllPosts().filter((p) => p.frontmatter.tags?.includes(tag));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-semibold">#{tag}</h1>
        <Breadcrumbs />
      </div>
      <div className="flex flex-col gap-3 mt-6">
        {posts.map((post) => (
          <Link key={post.path} href={post.path} className="flex items-center justify-between gap-4 p-2 border border-[var(--code-border)] rounded-lg no-underline text-inherit transition-[border-color,background] duration-200 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--code-border)_15%,transparent)]">
            <span className="text-sm font-semibold text-[var(--fg)]">{post.frontmatter.title}</span>
            <span className="text-xs text-[var(--fg-muted)] whitespace-nowrap shrink-0 tabular-nums">{formatDate(post.frontmatter.date)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
