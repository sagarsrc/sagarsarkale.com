import { getAboutContent } from "@/lib/content";
import { MDXRenderer } from "@/components/MDXRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "About — Sagar Sarkale",
};

export default function AboutPage() {
  const { frontmatter, content } = getAboutContent();

  return (
    <div>
      <Breadcrumbs />
      <h1 className="single-title">{frontmatter.title}</h1>
      <div className="prose" style={{ marginTop: '1.5rem' }}>
        <MDXRenderer content={content} />
      </div>
    </div>
  );
}
