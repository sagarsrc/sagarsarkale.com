import { getAboutContent } from "@/lib/content";
import { MDXContent } from "@/components/MDXContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "About — Sagar Sarkale",
};

export default function AboutPage() {
  const { frontmatter, content } = getAboutContent();

  return (
    <div>
      <Breadcrumbs />
      <div className="single-intro-container">
        <h1 className="single-title">{frontmatter.title}</h1>
      </div>
      <div className="single-content">
        <MDXContent content={content} />
      </div>
    </div>
  );
}
