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
      <Breadcrumbs />
      <h1 className="page-title">#{tag}</h1>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.path} className="post-list-item">
            <span className="post-date">{formatDate(post.frontmatter.date)}</span>
            <span className="post-title-link">
              <Link href={post.path}>{post.frontmatter.title}</Link>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
