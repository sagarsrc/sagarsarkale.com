import Link from 'next/link';
import { getAllPosts } from '@/lib/content';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/content';
import { Section } from '@/components/Section';
import { CoverReveal } from '@/components/CoverReveal';
import { SocialIcons } from '@/components/SocialIcons';

const press = [
  { name: 'YourStory', href: 'https://yourstory.com/2024/05/for-the-love-of-misal-smallstepai-is-building-an-llm-for-marathi' },
  { name: 'Moneycontrol', href: 'https://www.moneycontrol.com/news/technology/bootstrapped-ai-startup-smallstep-serves-up-misal-a-marathi-llm-12693311.html' },
  { name: 'ARB Podcast', href: 'https://www.youtube.com/watch?v=YHVFgb0RTVg' },
];

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
    href: 'https://smallstep.ai',
    linkLabel: 'smallstep.ai',
    extraLinks: [
      { href: 'https://huggingface.co/smallstepai', label: 'huggingface' },
      { href: '/blog', label: 'deep dive' },
    ],
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
  { tag: 'DeepDive', title: 'Deep Dives', desc: 'long-form breakdowns — vectorDB, LoRA, BLT, KV caching.', count: 9 },
];

export default function Home() {
  const blogPosts = getAllPosts()
    .filter((p: Post) => p.section === 'blog')
    .slice(0, 5);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="mb-20 max-md:mb-14">
        <div className="flex gap-10 max-md:block">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold tracking-tighter mb-1.5 max-md:text-3xl">
              Sagar Sarkale
            </h1>
            <p className="text-[0.8125rem] text-[var(--fg-muted)] font-mono tracking-wide uppercase mb-10">
              ai founder &middot; consultant &middot; engineer
            </p>

            <div className="max-w-[52ch] mb-4">
              <p className="font-serif text-lg text-[var(--fg-secondary)] leading-[1.75] mb-4 max-md:text-base">
                I&apos;ve trained LLMs from scratch, built agentic systems that ship,
                and optimized inference pipelines that run in production — served and supported 20M+ user base.
              </p>
              <p className="font-serif text-lg text-[var(--fg-secondary)] leading-[1.75] max-md:text-base">
                Currently building{' '}
                <a href="https://quickcall.dev" target="_blank" rel="noopener noreferrer" className="text-[var(--fg)] font-medium no-underline border-b border-[var(--border)] hover:border-[var(--fg)] transition-colors">QuickCall</a>.
              </p>
              <p className="font-serif text-lg text-[var(--fg-secondary)] leading-[1.75] max-md:text-base">
                Previously built India&apos;s first competitive <a href="/blog/genai/making-misal" className="text-[var(--fg)] font-medium no-underline border-b border-[var(--border)] hover:border-[var(--fg)] transition-colors">Marathi LLM</a>.<br />
                <span className="text-[0.8125rem] text-[var(--fg-muted)] font-mono font-normal">
                  covered by {press.map((p, i) => (
                    <span key={p.name}>
                      {i > 0 && (i === press.length - 1 ? ' & ' : ', ')}
                      {p.href ? (
                        <a href={p.href} target="_blank" rel="noopener noreferrer" className="text-[var(--fg-secondary)] font-semibold no-underline border-b border-[var(--border)] hover:border-[var(--fg-secondary)] transition-colors">{p.name}</a>
                      ) : (
                        <span className="text-[var(--fg-secondary)] font-semibold">{p.name}</span>
                      )}
                    </span>
                  ))}
                </span>
              </p>
            </div>

            <a href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center mt-8 text-[0.8125rem] font-semibold border border-[var(--border)] text-[var(--fg-secondary)] px-5 py-2.5 max-md:w-full max-md:py-3.5 rounded-md hover:border-[var(--fg)] hover:text-[var(--fg)] active:scale-[0.98] transition-all no-underline">
              book a call &rarr;
            </a>

            {/* Social icons — mobile only, below CTA */}
            <div className="hidden max-md:flex items-center gap-3 mt-6 [&_a]:text-[var(--fg-muted)] [&_a]:no-underline [&_a]:transition-colors [&_a]:duration-150 hover:[&_a]:text-[var(--accent)] [&_a]:p-2 [&_a]:-m-2 [&_svg]:w-[18px] [&_svg]:h-[18px]">
              <SocialIcons />
            </div>
          </div>

          {/* Wave + social icons — desktop only */}
          <div className="w-52 shrink-0 max-md:hidden flex flex-col items-center gap-5 self-center">
            <CoverReveal
              coverSrc="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/wave-hero.png"
              revealSrc="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/images/profile-reveal.png"
              alt="Sagar Sarkale"
            />
            <div className="flex items-center justify-between w-full [&_a]:text-[var(--fg-muted)] [&_a]:no-underline [&_a]:transition-colors [&_a]:duration-150 hover:[&_a]:text-[var(--accent)] [&_svg]:w-[18px] [&_svg]:h-[18px]">
              <SocialIcons />
            </div>
          </div>
        </div>

        {/* Wave strip — mobile only */}
        <div className="hidden max-md:block h-28 -mx-5 mt-10 overflow-hidden bg-[var(--surface)]" aria-hidden="true">
          <img src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/og-image.png" alt="" className="w-full h-full object-cover object-left" loading="lazy" />
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
                {h.extraLinks?.map((link) => (
                  link.href.startsWith('/') ? (
                    <Link key={link.label} href={link.href} className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">{link.label}</Link>
                  ) : (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">{link.label}</a>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Consulting ── */}
      <Section title="Consulting">
        <div className="space-y-0">
          {consulting.map((c) => (
            <div key={c.company} className="flex items-baseline gap-4 py-3.5 border-b border-[var(--border)]/40 max-md:flex-col max-md:gap-1">
              <div className="flex items-baseline gap-2 shrink-0">
                <span className="font-semibold text-[0.9375rem] text-[var(--fg)] w-[110px] max-md:w-auto">{c.company}</span>
                <span className="text-[0.8125rem] text-[var(--fg-muted)] tabular-nums md:hidden">{c.period}</span>
              </div>
              <span className="text-[0.9375rem] text-[var(--fg-secondary)] flex-1 min-w-0">{c.impact}</span>
              <span className="text-[0.8125rem] text-[var(--fg-muted)] tabular-nums shrink-0 max-md:hidden">{c.period}</span>
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
      <Section title="Writing">
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 mb-10">
          {writingCards.map((card) => (
            <Link
              key={card.tag}
              href={`/tags/${card.tag}`}
              className="group block border border-[var(--border)]/60 rounded-lg px-5 py-5 no-underline hover:border-[var(--accent)]/40 active:scale-[0.99] transition-all"
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

        <Link href="/blog" className="inline-flex items-center text-[0.8125rem] font-semibold border border-[var(--border)] text-[var(--fg-secondary)] px-5 py-2.5 rounded-md hover:border-[var(--fg)] hover:text-[var(--fg)] active:scale-[0.98] transition-all no-underline">
          all posts &rarr;
        </Link>
      </Section>
    </div>
  );
}
