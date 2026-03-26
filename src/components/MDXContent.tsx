import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { MermaidInit } from './Mermaid';

interface Props {
  content: string;
}

export function MDXContent({ content }: Props) {
  const hasMermaid = content.includes('class="mermaid"') || content.includes('pre class="mermaid"');

  return (
    <div className="prose">
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [rehypeRaw, rehypeSlug, rehypeKatex],
            format: 'md',
          },
        }}
      />
      {hasMermaid && <MermaidInit />}
    </div>
  );
}
