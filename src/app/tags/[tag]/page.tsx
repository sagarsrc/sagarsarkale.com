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
        <h1 className="text-xl font-semibold">#{tag}</h1>
        <Breadcrumbs />
      </div>
      <ul className="list-none p-0 my-4">
        {posts.map((post) => (
          <li key={post.path} className="!ml-0 flex items-baseline gap-4 py-[0.35rem] max-sm:flex-col max-sm:gap-[0.15rem]">
            <span className="text-xs text-[var(--fg-secondary)] whitespace-nowrap shrink-0 min-w-[90px]">{formatDate(post.frontmatter.date)}</span>
            <span className="text-sm [&_a]:text-[var(--fg)] [&_a]:no-underline [&_a:hover]:text-[var(--accent)]">
              <Link href={post.path}>{post.frontmatter.title}</Link>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
