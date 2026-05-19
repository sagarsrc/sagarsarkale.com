import Script from 'next/script';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { CopyCodeButton } from './CopyCodeButton';

interface Props {
  content: string;
  autonumber?: boolean;
}

const mdxComponents = {
  ul: (props: any) => <ul className="list-disc pl-6" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6" {...props} />,
  li: (props: any) => <li className="ml-0" {...props} />,
};

export function MDXRenderer({ content, autonumber }: Props) {
  const hasTweet = content.includes('twitter-tweet');
  return (
    <div className={autonumber ? 'prose autonumber' : 'prose'}>
      {hasTweet && (
        <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
      )}
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkMath],
            rehypePlugins: [
              rehypeRaw,
              [rehypePrettyCode, {
                theme: { dark: 'one-dark-pro', light: 'light-plus' },
                keepBackground: false,
                defaultLang: 'plaintext',
              }],
              rehypeSlug,
              [rehypeAutolinkHeadings, {
                behavior: 'append',
                properties: { className: ['heading-anchor'], ariaLabel: 'Link to section' },
                content: {
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['heading-anchor-icon'] },
                  children: [{ type: 'text', value: '#' }],
                },
              }],
              rehypeKatex,
            ],
            format: 'md',
          },
        }}
      />
      <CopyCodeButton />
    </div>
  );
}
