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
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-2xl font-semibold leading-snug">{frontmatter.title}</h1>
        <Breadcrumbs />
      </div>
      <div className="prose mt-6">
        <MDXRenderer content={content} />
      </div>
    </div>
  );
}
