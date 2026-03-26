import { getAllPosts } from '@/lib/content';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = 'https://sagarsarkale.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/work`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/random`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/tags`, changeFrequency: 'weekly', priority: 0.6 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}${post.path}`,
    lastModified: post.frontmatter.date ? new Date(post.frontmatter.date) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...postPages];
}
