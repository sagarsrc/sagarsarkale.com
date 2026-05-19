import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BackToTop } from '@/components/BackToTop';
import { MDXRenderer } from '@/components/MDXRenderer';
import { getAllPosts, getPostByPath } from '@/lib/content';
import { formatDate } from '@/lib/utils';
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

  const title = post.frontmatter.title;
  const description = post.frontmatter.description || post.frontmatter.summary || '';
  const ogImages = [{ url: `/og/random/${slug}.png`, width: 1200, height: 630, alt: title }];

  return {
    title,
    description,
    metadataBase: new URL('https://sagarsarkale.com'),
    alternates: {
      canonical: post.path,
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: post.path,
      siteName: 'Sagar Sarkale',
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function RandomPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostByPath('/random/' + slug);

  if (!post) notFound();

  const { frontmatter, content, readingTime } = post;

  return (
    <article>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-semibold leading-snug">{frontmatter.title}</h1>
        <Breadcrumbs />
      </div>

      <div className="text-xs text-[var(--fg-secondary)] mb-8 flex items-center gap-3 flex-wrap">
        {frontmatter.readTime !== false && (
          <span>{readingTime}</span>
        )}
        {frontmatter.date && (
          <span>&middot; {formatDate(frontmatter.date)}</span>
        )}
        {frontmatter.showTags !== false && frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap [&_a]:text-[var(--fg-secondary)] [&_a]:no-underline [&_a]:text-xs">
            {frontmatter.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`}>
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="prose">
        <MDXRenderer content={content} />
      </div>

      {!frontmatter.hideBackToTop && <BackToTop />}
    </article>
  );
}
