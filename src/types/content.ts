export interface PostFrontmatter {
  title: string;
  date?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  toc?: boolean;
  readTime?: boolean;
  autonumber?: boolean;
  math?: boolean;
  mermaid?: boolean;
  showTags?: boolean;
  hideBackToTop?: boolean;
}

export interface Post {
  slug: string;
  path: string; // full URL path e.g. /blog/genai/what-is-mcp-part1
  frontmatter: PostFrontmatter;
  content: string;
  readingTime: string;
  section: string; // blog, random
  subsection?: string; // genai, seq, web
  coverImage?: string; // first image in content, extracted automatically
}
