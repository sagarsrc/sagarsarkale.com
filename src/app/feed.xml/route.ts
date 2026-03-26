import { getAllPosts } from '@/lib/content';

export const dynamic = 'force-static';

const BASE_URL = 'https://sagarsarkale.com';

export async function GET() {
  const posts = getAllPosts().filter((p) => p.section === 'blog');

  const items = posts
    .map((post) => {
      const title = post.frontmatter.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const desc = (post.frontmatter.description || post.frontmatter.summary || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const pubDate = post.frontmatter.date ? new Date(post.frontmatter.date).toUTCString() : new Date().toUTCString();
      const link = `${BASE_URL}${post.path}`;
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
      <guid>${link}</guid>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sagar Sarkale</title>
    <link>${BASE_URL}</link>
    <description>Sagar's digital corner</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
