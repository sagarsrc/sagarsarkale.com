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
      <h1 className="single-title text-2xl font-bold font-mono mb-2 leading-[1.3]">{frontmatter.title}</h1>
      <div className="prose mt-6">
        <MDXRenderer content={content} />
      </div>
    </div>
  );
}
