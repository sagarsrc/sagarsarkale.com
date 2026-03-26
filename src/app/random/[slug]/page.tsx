import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BackToTop } from '@/components/BackToTop';
import { MDXRenderer } from '@/components/MDXRenderer';
import { getAllPosts, getPostByPath } from '@/lib/content';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts().filter((p) => p.section === 'random');
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostByPath('/random/' + slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description || post.frontmatter.summary,
  };
}

export default async function RandomPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostByPath('/random/' + slug);

  if (!post) notFound();

  const { frontmatter, content, readingTime } = post;

  return (
    <article>
      <Breadcrumbs />
      <h1 className="single-title">{frontmatter.title}</h1>

      <div className="post-meta">
        {frontmatter.readTime !== false && (
          <span className="reading-time">{readingTime}</span>
        )}
        {frontmatter.showTags !== false && frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="post-tags">
            {frontmatter.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`} className="tag">
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      <MDXRenderer content={content} />

      {!frontmatter.hideBackToTop && <BackToTop />}
    </article>
  );
}
