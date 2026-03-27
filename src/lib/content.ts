import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { execSync } from "child_process";
import crypto from "crypto";
import type { Post, PostFrontmatter } from "@/types/content";

const CONTENT_DIR = path.join(process.cwd(), "content");

interface ContentSection {
  section: string;
  subsection?: string;
  dir: string;
}

const SECTIONS: ContentSection[] = [
  { section: "blog", subsection: "genai", dir: "blog/genai" },
  { section: "blog", subsection: "seq", dir: "blog/seq" },
  { section: "blog", subsection: "web", dir: "blog/web" },
  { section: "random", dir: "random" },
];

export function convertShortcodes(content: string): string {
  // {{< figure src="..." width="..." height="..." caption="..." >}}
  // Also handles {{<figure ...>}} (no spaces)
  content = content.replace(/\{\{<\s*figure\s+([^>]*?)>\s*\}\}/g, (_: string, attrs: string) => {
    const srcMatch = attrs.match(/src="([^"]+)"/);
    const widthMatch = attrs.match(/width="([^"]+)"/);
    const heightMatch = attrs.match(/height="([^"]+)"/);
    const captionMatch = attrs.match(/caption="([^"]+)"/);
    const src = srcMatch ? srcMatch[1] : '';
    const styles: string[] = [];
    if (widthMatch) styles.push(`width:${widthMatch[1]};max-width:100%`);
    if (heightMatch) styles.push(`height:${heightMatch[1]}`);
    const styleAttr = styles.length ? ` style="${styles.join(';')}"` : '';
    const alt = captionMatch ? captionMatch[1] : '';
    const caption = captionMatch ? `<figcaption>${captionMatch[1]}</figcaption>` : '';
    return `<figure style="display:flex;flex-direction:column;align-items:center"><img src="${src}" alt="${alt}"${styleAttr} />${caption}</figure>\n\n`;
  });

  // {{< customfont font="..." weight="..." size="..." >}} ... {{< /customfont >}}
  content = content.replace(
    /\{\{<\s*customfont\s+([^>]*?)>\s*\}\}([\s\S]*?)\{\{<\s*\/customfont\s*>\s*\}\}/g,
    (_: string, attrs: string, inner: string) => {
      const fontMatch = attrs.match(/font="([^"]+)"/);
      const weightMatch = attrs.match(/weight="([^"]+)"/);
      const sizeMatch = attrs.match(/size="([^"]+)"/);
      const font = fontMatch ? fontMatch[1] : 'inherit';
      const weight = weightMatch ? `font-weight:${weightMatch[1]};` : '';
      const size = sizeMatch ? `font-size:${sizeMatch[1]};` : '';
      // Load Google Font via link tag embedded in HTML
      const fontImport = fontMatch
        ? `<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}&display=swap" rel="stylesheet" />`
        : '';
      return `${fontImport}<span style="font-family:'${font}',cursive;${weight}${size}">${inner.trim()}</span>`;
    }
  );

  // {{< spotify type="..." id="..." >}}
  content = content.replace(/\{\{<\s*spotify\s+([^>]*?)>\s*\}\}/g, (_: string, attrs: string) => {
    const typeMatch = attrs.match(/type="([^"]+)"/);
    const idMatch = attrs.match(/id="([^"]+)"/);
    if (typeMatch && idMatch) {
      return `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/${typeMatch[1]}/${idMatch[1]}?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    }
    return '';
  });

  // {{< details title="..." >}} ... {{< /details >}}
  content = content.replace(
    /\{\{<\s*details\s+([^>]*?)>\s*\}\}([\s\S]*?)\{\{<\s*\/details\s*>\s*\}\}/g,
    (_: string, attrs: string, inner: string) => {
      const titleMatch = attrs.match(/title="([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : 'Details';
      return `<details><summary>${title}</summary>\n\n${inner.trim()}\n\n</details>`;
    }
  );

  // {{< linebreak >}}
  content = content.replace(/\{\{<\s*linebreak\s*>\s*\}\}/g, '<br />');

  // {{< tweet id="..." >}}
  content = content.replace(/\{\{<\s*tweet\s+([^>]*?)>\s*\}\}/g, (_: string, attrs: string) => {
    const idMatch = attrs.match(/id="([^"]+)"/);
    if (idMatch) {
      return `<blockquote class="twitter-tweet"><a href="https://twitter.com/x/status/${idMatch[1]}">Tweet</a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>`;
    }
    return '';
  });

  // {{< gist user="..." id="..." >}}
  content = content.replace(/\{\{<\s*gist\s+([^>]*?)>\s*\}\}/g, (_: string, attrs: string) => {
    const userMatch = attrs.match(/user="([^"]+)"/);
    const idMatch = attrs.match(/id="([^"]+)"/);
    if (userMatch && idMatch) {
      return `<script src="https://gist.github.com/${userMatch[1]}/${idMatch[1]}.js"></script>`;
    }
    return '';
  });

  // {{< mermaid >}} ... {{< /mermaid >}} — render to static SVG at build time
  content = content.replace(
    /\{\{<\s*mermaid\s*>\s*\}\}([\s\S]*?)\{\{<\s*\/mermaid\s*>\s*\}\}/g,
    (_: string, inner: string) => {
      const src = inner.trim();
      const hash = crypto.createHash('md5').update(src).digest('hex').slice(0, 10);
      const cacheDir = path.join(process.cwd(), '.mermaid-cache');
      const svgPath = path.join(cacheDir, `${hash}.svg`);

      if (!fs.existsSync(svgPath)) {
        fs.mkdirSync(cacheDir, { recursive: true });
        const tmpIn = path.join(cacheDir, `${hash}.mmd`);
        fs.writeFileSync(tmpIn, src);
        try {
          execSync(`npx mmdc -i ${tmpIn} -o ${svgPath} --quiet`, {
            timeout: 15000,
            stdio: 'pipe',
          });
        } catch (e) {
          console.warn('Mermaid build-time render failed:', e);
          return `<pre class="mermaid">${src}</pre>`;
        } finally {
          fs.unlinkSync(tmpIn);
        }
      }

      let svg = fs.readFileSync(svgPath, 'utf-8');
      // Strip XML header if present
      svg = svg.replace(/<\?xml[^?]*\?>\s*/, '');
      // Make SVG responsive
      svg = svg.replace(/<svg /, '<svg style="max-width:100%;height:auto" ');
      return `<div class="mermaid-diagram">${svg}</div>`;
    }
  );

  // ---\n{{<author>}} (absorb preceding hr)
  content = content.replace(/\n---\s*\n+\{\{<\s*author\s*>\s*\}\}/g, () => {
    return `\n\n<div style="margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border);font-family:var(--font-sans);font-size:14px;color:var(--fg-muted)">Written by <a href="https://linkedin.com/in/sagar-sarkale" style="color:var(--accent);text-decoration:none">Sagar Sarkale</a></div>\n\n`;
  });

  // standalone {{<author>}} (no preceding hr)
  content = content.replace(/\{\{<\s*author\s*>\s*\}\}/g, () => {
    return `\n\n<div style="margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border);font-family:var(--font-sans);font-size:14px;color:var(--fg-muted)">Written by <a href="https://linkedin.com/in/sagar-sarkale" style="color:var(--accent);text-decoration:none">Sagar Sarkale</a></div>\n\n`;
  });

  // manual "Written By" blocks from old Hugo posts (absorb preceding hr)
  content = content.replace(/\n---\s*\n+Written By\s*\n+>\s*\[Sagar Sarkale\]\([^)]+\)/gi, () => {
    return `\n\n<div style="margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border);font-family:var(--font-sans);font-size:14px;color:var(--fg-muted)">Written by <a href="https://linkedin.com/in/sagar-sarkale" style="color:var(--accent);text-decoration:none">Sagar Sarkale</a></div>\n\n`;
  });

  // {{<github owner="..." repo="..." path="..." branch="..." lang="...">}}
  content = content.replace(/\{\{<\s*github\s+([^>]*?)>\s*\}\}/g, (_: string, attrs: string) => {
    const ownerMatch = attrs.match(/owner="([^"]+)"/);
    const repoMatch = attrs.match(/repo="([^"]+)"/);
    const pathMatch = attrs.match(/path="([^"]+)"/);
    const branchMatch = attrs.match(/branch="([^"]+)"/);
    const langMatch = attrs.match(/lang="([^"]+)"/);
    if (ownerMatch && repoMatch && pathMatch) {
      const owner = ownerMatch[1];
      const repo = repoMatch[1];
      const filePath = pathMatch[1];
      const branch = branchMatch ? branchMatch[1] : 'main';
      const lang = langMatch ? langMatch[1] : '';
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
      const fileUrl = `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`;

      let code = '';
      try {
        const { execSync } = require('child_process');
        code = execSync(`curl -sL "${rawUrl}"`, { encoding: 'utf-8', timeout: 10000 }).trim();
      } catch {
        return `\n\n> [${filePath}](${fileUrl}) on GitHub\n\n`;
      }

      // Escape backticks in the code to prevent breaking the markdown fence
      const fence = '```';
      return `\n\n<div style="font-size:12px;color:var(--fg-muted);font-family:var(--font-mono);margin-bottom:4px">${filePath}</div>\n\n${fence}${lang}\n${code}\n${fence}\n\n<p style="font-size:12px;color:var(--fg-muted);margin-top:4px">source: <a href="${fileUrl}" style="color:var(--accent)">${fileUrl}</a></p>\n\n`;
    }
    return '';
  });

  // Clean up any remaining unhandled shortcodes
  content = content.replace(/\{\{<\s*[^>]*>\s*\}\}/g, '');
  content = content.replace(/\{\{<\s*\/[^>]*>\s*\}\}/g, '');

  return content;
}

function parseFile(
  filePath: string,
  slug: string,
  section: string,
  subsection?: string
): Post | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as PostFrontmatter;
    if (fm.date) {
      // gray-matter auto-converts dates to Date objects
      const d = (fm.date as unknown) instanceof Date ? (fm.date as unknown as Date) : new Date(String(fm.date));
      fm.date = d.toISOString().slice(0, 10);
    }

    const urlPath = subsection
      ? `/blog/${subsection}/${slug}`
      : `/${section}/${slug}`;

    const cleanContent = convertShortcodes(content);
    const stats = readingTime(cleanContent);

    // Extract first image as cover
    const imgMatch = cleanContent.match(/<img[^>]+src="([^"]+)"/);
    const coverImage = imgMatch ? imgMatch[1] : undefined;

    return {
      slug,
      path: urlPath,
      frontmatter: fm,
      content: cleanContent,
      readingTime: stats.text,
      section,
      subsection,
      coverImage,
    };
  } catch {
    return null;
  }
}

function getMdFiles(dir: string): string[] {
  const fullDir = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir)
    .filter(
      (f) =>
        (f.endsWith(".md") || f.endsWith(".mdx")) && !f.startsWith("_index")
    );
}

export function getAllPosts(): Post[] {
  const posts: Post[] = [];

  for (const { section, subsection, dir } of SECTIONS) {
    const files = getMdFiles(dir);
    for (const file of files) {
      const slug = file.replace(/\.(md|mdx)$/, "");
      const filePath = path.join(CONTENT_DIR, dir, file);
      const post = parseFile(filePath, slug, section, subsection);
      if (post) posts.push(post);
    }
  }

  return posts.sort((a, b) => {
    const da = String(a.frontmatter.date ?? "");
    const db = String(b.frontmatter.date ?? "");
    return db.localeCompare(da);
  });
}

export function getPostsBySection(section: string): Post[] {
  return getAllPosts().filter((p) => p.section === section);
}

export function getPostsBySubsection(subsection: string): Post[] {
  return getAllPosts().filter((p) => p.subsection === subsection);
}

export function getPostsByTag(tag: string): Post[] {
  const lower = tag.toLowerCase();
  return getAllPosts().filter((p) =>
    p.frontmatter.tags?.some((t) => t.toLowerCase() === lower)
  );
}

export function getPost(
  section: string,
  subsection: string | undefined,
  slug: string
): Post | null {
  const dir = subsection ? `${section}/${subsection}` : section;
  const mdPath = path.join(CONTENT_DIR, dir, `${slug}.md`);
  const mdxPath = path.join(CONTENT_DIR, dir, `${slug}.mdx`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;

  if (!fs.existsSync(filePath)) return null;
  return parseFile(filePath, slug, section, subsection);
}

export function getBlogPost(subsection: string, slug: string): Post | null {
  return getPost("blog", subsection, slug);
}

export function getRandomPost(slug: string): Post | null {
  return getPost("random", undefined, slug);
}

function getSinglePage(filename: string): { frontmatter: PostFrontmatter; content: string } {
  const filePath = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return { frontmatter: { title: filename.replace(/\.(md|mdx)$/, "") }, content: "" };
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data as PostFrontmatter, content: convertShortcodes(content) };
}

export function getAboutContent() {
  return getSinglePage("about.md");
}

export function getWorkContent() {
  return getSinglePage("work.md");
}

export function getPostByPath(urlPath: string): Post | null {
  return getAllPosts().find((p) => p.path === urlPath) ?? null;
}

export function getBlogPosts(): Post[] {
  return getPostsBySection("blog");
}

export function getRelatedPosts(currentPath: string, limit: number = 3): Post[] {
  const current = getPostByPath(currentPath);
  if (!current) return [];

  const allPosts = getAllPosts().filter(p => p.path !== currentPath && p.section === 'blog');
  const currentTags = current.frontmatter.tags?.map(t => t.toLowerCase()) || [];

  // Score by: same subsection (+2), shared tags (+1 each)
  const scored = allPosts.map(p => {
    let score = 0;
    if (p.subsection === current.subsection) score += 2;
    const pTags = p.frontmatter.tags?.map(t => t.toLowerCase()) || [];
    for (const tag of pTags) {
      if (currentTags.includes(tag)) score += 1;
    }
    return { post: p, score };
  });

  scored.sort((a, b) => b.score - a.score || (b.post.frontmatter.date ?? '').localeCompare(a.post.frontmatter.date ?? ''));

  return scored.slice(0, limit).filter(s => s.score > 0).map(s => s.post);
}

export interface TocEntry {
  depth: number;
  text: string;
  id: string;
}

export function extractToc(content: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const depth = match[1].length;
      const text = match[2].replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1').trim();
      // Match rehype-slug: lowercase, remove non-alphanumeric (keep spaces/hyphens), spaces to hyphens
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      entries.push({ depth, text, id });
    }
  }
  return entries;
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllPosts().forEach((p) =>
    p.frontmatter.tags?.forEach((t) => tags.add(t))
  );
  return Array.from(tags).sort();
}
