import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypePrettyCode from 'rehype-pretty-code';
import { MermaidInit } from './Mermaid';
import { CopyCodeButton } from './CopyCodeButton';

interface Props {
  content: string;
}

const mdxComponents = {
  ul: (props: any) => <ul className="list-disc pl-6" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6" {...props} />,
  li: (props: any) => <li className="ml-0" {...props} />,
};

export function MDXRenderer({ content }: Props) {
  const hasMermaid = content.includes('class="mermaid"') || content.includes('pre class="mermaid"');

  return (
    <div className="prose">
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [
              [rehypePrettyCode, {
                theme: { dark: 'one-dark-pro', light: 'light-plus' },
                keepBackground: false,
                defaultLang: 'plaintext',
              }],
              rehypeRaw,
              rehypeSlug,
              rehypeKatex,
            ],
            format: 'md',
          },
        }}
      />
      <CopyCodeButton />
      {hasMermaid && <MermaidInit />}
    </div>
  );
}
