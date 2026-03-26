import { getWorkContent } from "@/lib/content";
import { MDXContent } from "@/components/MDXContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "Work — Sagar Sarkale",
};

export default function WorkPage() {
  const { frontmatter, content } = getWorkContent();

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
