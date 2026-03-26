import { getWorkContent } from "@/lib/content";
import { MDXRenderer } from "@/components/MDXRenderer";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "Work — Sagar Sarkale",
};

export default function WorkPage() {
  const { frontmatter, content } = getWorkContent();

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
