import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/content';
import { Section } from '@/components/Section';

const press = ['YourStory', 'Moneycontrol', 'ARB Podcast'];

const highlights = [
  {
    label: 'quickcall.dev',
    role: 'Founder',
    period: '2025 – present',
    desc: 'contextual memory for agentic engineering teams — captures what ships, loads what matters. used across Claude Code, Cursor, Codex, Gemini CLI.',
    href: 'https://quickcall.dev',
    linkLabel: 'quickcall.dev',
    current: true,
  },
  {
    label: 'misal — marathi llm',
    role: 'Founder, smallstep.ai',
    period: '2023 – 2024',
    desc: 'india\'s first competitive marathi llm. 7B & 1B params trained on 2B+ tokens. custom tokenizer that fixed llama\'s 3-5x inefficiency. beat gpt-3.5 on reading comprehension. open-sourced everything.',
    href: 'https://huggingface.co/smallstepai',
    linkLabel: 'huggingface',
    secondaryLink: { href: '/blog', label: 'deep dive' },
    current: false,
  },
];

const consulting = [
  { company: 'Yral', impact: 'RAG moderation +26% accuracy, 150 tok/sec inference, real-time recs at scale', period: '2025' },
  { company: 'People+AI', impact: 'designed india\'s first standardized LLM leaderboard across 22 languages', period: '2024' },
  { company: 'Medpiper', impact: '10x medical document processing (10 min → 1 min)', period: '2024' },
];

const prior = [
  { company: 'Tekion', role: 'Data Scientist', impact: 'document AI — Mask-RCNN table extraction at scale', period: '2022–23' },
  { company: 'Pratilipi', role: 'Data Scientist', impact: '2x reads growth, 20% follow increase from recs', period: '2020–22' },
];

const writingCards = [
  { tag: 'Foundations', title: 'Foundations', desc: 'RNNs → LSTMs → Transformers. the learning-from-scratch track.', count: 3 },
  { tag: 'Transformers', title: 'Transformers', desc: 'attention, position encoding, KV caching, BLT, multimodal.', count: 6 },
  { tag: 'MCP', title: 'MCP', desc: 'model context protocol — primitives to elicitation. 3-part series.', count: 3 },
  { tag: 'DeepDive', title: 'Deep Dives', desc: 'long-form breakdowns — vectorDB, LoRA, BLT, KV caching.', count: 6 },
];

export default function Home() {
  const blogPosts = getAllPosts()
    .filter((p: Post) => p.section === 'blog')
    .slice(0, 5);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="mb-24 max-md:mb-16">
        <h1 className="text-4xl font-bold tracking-tighter mb-1.5 max-md:text-3xl">
          Sagar Sarkale
        </h1>
        <p className="text-[0.8125rem] text-[var(--fg-muted)] font-mono tracking-wide uppercase mb-8">
          ai founder &middot; consultant &middot; engineer
        </p>

        <div className="max-w-[52ch] mb-8">
          <p className="font-serif text-lg text-[var(--fg-secondary)] leading-[1.75] mb-4 max-md:text-base">
            I build AI products from research to production — language models,
            retrieval systems, inference infrastructure.
          </p>
          <p className="font-serif text-lg text-[var(--fg-secondary)] leading-[1.75] max-md:text-base">
            Currently building{' '}
            <a href="https://quickcall.dev" target="_blank" rel="noopener noreferrer" className="text-[var(--fg)] font-medium no-underline border-b border-[var(--border)] hover:border-[var(--fg)] transition-colors">QuickCall</a>.
            Previously built India&apos;s first competitive Marathi LLM.
          </p>
        </div>

        <p className="text-[0.8125rem] text-[var(--fg-muted)] font-mono">
          covered by {press.map((p, i) => (
            <span key={p}>
              {i > 0 && (i === press.length - 1 ? ' & ' : ', ')}
              <span className="text-[var(--fg-secondary)] font-semibold">{p}</span>
            </span>
          ))}
        </p>

        <div className="mt-10 pt-8 border-t border-[var(--border)]/40">
          <div className="flex items-center flex-wrap gap-5">
            <a href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[0.8125rem] font-semibold border border-[var(--border)] text-[var(--fg-secondary)] px-5 py-2.5 rounded-md hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors no-underline">
              book a call &rarr;
            </a>
            <div className="flex items-center gap-4 text-[0.8125rem] text-[var(--fg-secondary)]">
              <a href="mailto:sagar@quickcall.dev" className="hover:text-[var(--fg)] transition-colors no-underline">email</a>
              <span className="text-[var(--fg-muted)]">/</span>
              <a href="https://www.linkedin.com/in/sagar-sarkale/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">linkedin</a>
              <span className="text-[var(--fg-muted)]">/</span>
              <a href="https://x.com/sagar_sarkale" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">twitter</a>
              <span className="text-[var(--fg-muted)]">/</span>
              <a href="https://github.com/sagarsrc" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)] transition-colors no-underline">github</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── What I Built ── */}
      <Section title="What I Built">
        <div className="space-y-10">
          {highlights.map((h) => (
            <div key={h.label}>
              <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                <h3 className="text-base font-semibold">{h.label}</h3>
                {h.current && (
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-[var(--accent)]">current</span>
                )}
                {!h.current && (
                  <span className="text-[0.6875rem] font-medium uppercase tracking-widest text-[var(--fg-muted)]">shipped {h.period}</span>
                )}
              </div>
              <p className="text-[0.8125rem] text-[var(--fg-muted)] mb-3">{h.role}</p>
              <p className="text-[0.9375rem] text-[var(--fg-secondary)] leading-[1.65] mb-4 max-w-[56ch]">
                {h.desc}
              </p>
              <div className="flex gap-5 text-[0.8125rem]">
                <a href={h.href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">{h.linkLabel}</a>
                {h.secondaryLink && (
                  <Link href={h.secondaryLink.href} className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">{h.secondaryLink.label}</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Consulting ── */}
      <Section title="Consulting">
        <div className="space-y-0">
          {consulting.map((c) => (
            <div key={c.company} className="flex items-baseline gap-4 py-3.5 border-b border-[var(--border)]/40 max-sm:flex-col max-sm:gap-1">
              <div className="flex items-baseline gap-2 shrink-0">
                <span className="font-semibold text-[0.9375rem] text-[var(--fg)] w-[110px] max-sm:w-auto">{c.company}</span>
                <span className="text-[0.8125rem] text-[var(--fg-muted)] tabular-nums sm:hidden">{c.period}</span>
              </div>
              <span className="text-[0.9375rem] text-[var(--fg-secondary)] flex-1 min-w-0">{c.impact}</span>
              <span className="text-[0.8125rem] text-[var(--fg-muted)] tabular-nums shrink-0 max-sm:hidden">{c.period}</span>
            </div>
          ))}
        </div>

        <div className="flex items-baseline gap-3 mt-5">
          {prior.map((p) => (
            <span key={p.company} className="text-[0.8125rem] text-[var(--fg-muted)]">
              {p.company} <span>({p.period})</span>
            </span>
          ))}
          <span className="text-[var(--fg-muted)] text-[0.8125rem]">&middot;</span>
          <Link href="/work" className="text-[0.8125rem] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">
            full history
          </Link>
        </div>
      </Section>

      {/* ── Writing ── */}
      <Section title="Writing" border={false}>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-10">
          {writingCards.map((card) => (
            <Link
              key={card.tag}
              href={`/tags/${card.tag}`}
              className="group block border border-[var(--border)]/60 rounded-lg px-5 py-5 no-underline hover:border-[var(--accent)]/40 transition-colors"
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[0.9375rem] font-semibold group-hover:text-[var(--accent)] transition-colors">
                  #{card.title}
                </span>
                <span className="text-[0.8125rem] text-[var(--fg-muted)] tabular-nums">
                  {card.count} posts
                </span>
              </div>
              <p className="text-[0.8125rem] text-[var(--fg-muted)] leading-relaxed">
                {card.desc}
              </p>
            </Link>
          ))}
        </div>

        <Link href="/blog" className="inline-flex items-center text-[0.8125rem] font-semibold border border-[var(--border)] text-[var(--fg-secondary)] px-5 py-2.5 rounded-md hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors no-underline">
          all posts &rarr;
        </Link>
      </Section>
    </div>
  );
}
