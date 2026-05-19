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
  { section: "agents", dir: "agents" },
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

  // {{< embed url="..." title="..." description="..." >}}
  content = content.replace(/\{\{<\s*embed\s+([^>]*?)>\s*\}\}/g, (_: string, attrs: string) => {
    const urlMatch = attrs.match(/url="([^"]+)"/);
    const titleMatch = attrs.match(/title="([^"]+)"/);
    const descMatch = attrs.match(/description="([^"]+)"/);
    const url = urlMatch ? urlMatch[1] : '';
    const title = titleMatch ? titleMatch[1] : '';
    const description = descMatch ? descMatch[1] : '';
    if (!url) return '';

    // Detect platform for icon + styling
    const isGitHub = url.includes('github.com');
    const domain = new URL(url).hostname.replace(/^www\./, '');
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const platformIcon = isGitHub
      ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display:inline-block;vertical-align:-2px;margin-right:4px"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`
      : `<img src="${favicon}" width="16" height="16" alt="" style="display:inline-block;vertical-align:-2px;margin-right:4px;border-radius:2px" />`;
    const platformColor = isGitHub ? '#238636' : 'var(--accent)';
    const platformLabel = isGitHub ? 'GitHub' : domain;

    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="embed-card" style="display:block;border:1px solid var(--code-border);border-radius:10px;padding:14px 16px;margin:1rem 0;text-decoration:none;color:inherit;background:var(--surface);transition:border-color .15s,background .15s">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:12px;color:var(--fg-muted)">
        ${platformIcon}
        <span>${platformLabel}</span>
      </div>
      ${title ? `<div style="font-size:15px;font-weight:600;color:var(--fg);line-height:1.35;margin-bottom:4px">${title}</div>` : ''}
      ${description ? `<div style="font-size:13px;color:var(--fg-secondary);line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${description}</div>` : ''}
      <div style="margin-top:8px;font-size:12px;color:var(--fg-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${url}</div>
    </a>`;
  });

  // {{< tweet id="..." >}}
  content = content.replace(/\{\{<\s*tweet\s+([^>]*?)>\s*\}\}/g, (_: string, attrs: string) => {
    const idMatch = attrs.match(/id="([^"]+)"/);
    if (idMatch) {
      return `<blockquote class="twitter-tweet"><a href="https://twitter.com/x/status/${idMatch[1]}">Tweet</a></blockquote>`;
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

    // Cover image: prefer frontmatter `cover`, else extract first static image
    const imgMatch = cleanContent.match(/<img[^>]+src="([^"]+\.(?:png|jpg|jpeg|webp|svg))"/i);
    const coverImage = fm.cover || (imgMatch ? imgMatch[1] : undefined);

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

  const allPosts = getAllPosts().filter(p => p.path !== currentPath && p.section === current.section);
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
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/ /g, '-')
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
