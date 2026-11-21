import Image from "next/image";
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
      <div className="mt-6 grid items-start gap-6 sm:grid-cols-[minmax(0,1fr)_12rem] sm:gap-8">
        <Image
          src="/sagar-portrait.webp"
          alt="Sagar Sarkale"
          width={640}
          height={800}
          className="w-40 sm:col-start-2 sm:row-start-1 sm:w-full"
        />
        <div className="prose sm:col-start-1 sm:row-start-1 [&>p:first-child]:mt-0">
          <MDXRenderer content={content} />
        </div>
      </div>
    </div>
  );
}
