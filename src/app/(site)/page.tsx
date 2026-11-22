import { ProjectVisual } from '@/components/ProjectVisual';
import { WaveOpening } from '@/components/WaveOpening';
import { HalftoneField } from '@/components/HalftoneField';
import { CountUp, Reveal, ScrollVar } from '@/components/Motion';
import { getBlogPosts, getPostsByTag } from '@/lib/content';
import Link from 'next/link';
import './landing.css';
import Image from 'next/image';
import { SocialIcons } from '@/components/SocialIcons';
import { ScrollStage } from '@/components/ScrollStage';

const CALL = 'https://calendar.app.google/z5J1gxmUkQ3vvzjT6';

const press = [
  { name: 'YourStory', href: 'https://yourstory.com/2024/05/for-the-love-of-misal-smallstepai-is-building-an-llm-for-marathi' },
  { name: 'Moneycontrol', href: 'https://www.moneycontrol.com/news/technology/bootstrapped-ai-startup-smallstep-serves-up-misal-a-marathi-llm-12693311.html' },
  { name: 'ARB Podcast', href: 'https://www.youtube.com/watch?v=YHVFgb0RTVg' },
];

const proof = [
  { value: 100, suffix: 'K', label: 'agent sessions QuickCall has read, so the next one starts smarter' },
  { value: 1.3, decimals: 1, suffix: 'B', label: 'tokens of engineering conversation turned into team memory' },
  { value: 2, suffix: 'B+', label: 'Marathi tokens behind Misal, India’s first competitive Marathi LLM' },
  { value: 22, suffix: '', label: 'Indian languages measured on one leaderboard for People+AI' },
];

const highlights = [
  {
    print: 'quickcall' as const,
    label: 'quickcall.dev',
    role: 'Founder',
    period: '2025 – present',
    desc: 'Compounding memory for agentic engineering teams. It captures what ships and loads what matters, so one developer’s fix becomes every agent’s habit.',
    facts: [['Works in', 'Claude Code · Cursor · Codex · Gemini CLI'], ['So far', '10M+ messages processed · closed beta']],
    href: 'https://quickcall.dev',
    linkLabel: 'quickcall.dev',
    extraLinks: [{ href: '/blog/genai/what-is-mcp-part2', label: 'build notes' }],
  },
  {
    print: 'misal' as const,
    label: 'misal — marathi llm',
    role: 'Founder, smallstep.ai',
    period: '2023 – 2024',
    desc: 'India’s first competitive Marathi LLM. A custom tokenizer fixed Llama’s 3–5× inefficiency on Marathi, and the model beat GPT-3.5 on reading comprehension. Everything was open-sourced.',
    facts: [['Models', '7B and 1B parameters'], ['Trained on', '2B+ tokens']],
    href: 'https://smallstep.ai',
    linkLabel: 'smallstep.ai',
    extraLinks: [
      { href: 'https://huggingface.co/smallstepai', label: 'huggingface' },
      { href: '/blog/genai/making-misal', label: 'deep dive' },
    ],
  },
];

const consulting = [
  { company: 'Yral', metric: '+26%', impact: 'RAG moderation accuracy, 150 tok/sec inference and real-time recommendations at scale.', period: '2025' },
  { company: 'People+AI', metric: '22', impact: 'Designed India’s first standardized LLM leaderboard across 22 languages.', period: '2024' },
  { company: 'Medpiper', metric: '10×', impact: 'Medical document processing cut from ten minutes to one.', period: '2024' },
];

const prior = [
  { company: 'Tekion', role: 'Data Scientist', impact: 'Document AI with Mask-RCNN table extraction at scale', period: '2022–23' },
  { company: 'Pratilipi', role: 'Data Scientist', impact: '2× reads growth and 20% more follows from recommendations', period: '2020–22' },
];

const topics = ['Foundations', 'Transformers', 'MCP', 'DeepDive'];

type Token = string | { em: string };
const leadA: Token[] = ['Curiosity', 'gets', 'me', 'started,', 'and', { em: 'conviction' }, 'keeps', 'me', 'going.'];
const leadB: Token[] = 'I dig into the details, follow every thread, and see the work through.'.split(' ');

function Ink({ tokens, offset, total }: { tokens: Token[]; offset: number; total: number }) {
  return tokens.map((t, i) => {
    const style = { '--i': (offset + i) / total } as React.CSSProperties;
    return (
      <span key={i} className="ink" style={style}>
        {typeof t === 'string' ? t : <em>{t.em}</em>}{i < tokens.length - 1 ? ' ' : ''}
      </span>
    );
  });
}

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

const Arrow = () => (
  <svg className="arrow" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M4 14 14 4M6 4h8v8" />
  </svg>
);

export default function Home() {
  const posts = getBlogPosts().slice(0, 5);
  const topicCounts = topics.map((t) => ({ tag: t, count: getPostsByTag(t).length }));
  const total = leadA.length + leadB.length;

  return (
    <div className="landing">
      <ScrollStage />
      <WaveOpening>
        <section className="landing-hero">
          <div className="landing-art">
            <noscript><style>{'.landing-art img{opacity:1}'}</style></noscript>
            <Image
              src="/indigo-curl.webp"
              width={1080}
              height={1080}
              preload
              alt="A breaking wave printed in coarse indigo halftone dots on ivory paper."
            />
            <HalftoneField variant="wave" />
          </div>
          <div className="landing-masthead">
            <figure className="mast-quote">
              <blockquote>
                <p>
                  <span className="mast-line"><span>You can’t stop the wave.</span></span>
                  <span className="mast-line"><span>But you can build the <em>ship</em>.</span></span>
                </p>
              </blockquote>
              <figcaption><span className="mast-dash" aria-hidden="true">—</span><h1>Sagar Sarkale</h1></figcaption>
            </figure>
            <a className="mast-cta" href="#contact">Let’s build one for you</a>
          </div>
          <a className="landing-next" href="#introduction" aria-label="Read the introduction">
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M10 3v17m-7-7 7 7 7-7" />
            </svg>
          </a>
        </section>
        <ScrollVar className="landing-intro" id="introduction" start={0.95} end={0.75}>
          <p className="landing-label">(01) Introduction</p>
          <p className="landing-lead">
            <span><Ink tokens={leadA} offset={0} total={total} /></span>{' '}
            <span><Ink tokens={leadB} offset={leadA.length} total={total} /></span>
          </p>
          <div className="landing-bio">
            <p>I lead engineering at <a href="https://www.cmul8.com/about/">CMUL8</a>, an AI economics lab.</p>
            <p>I built <a href="https://quickcall.dev">QuickCall</a> for coding teams and <Link href="/blog/genai/making-misal">Misal</Link> for people who use AI in Marathi.</p>
            <p className="landing-press">
              covered by {press.map((item, index) => (
                <span key={item.name}>
                  {index > 0 && (index === press.length - 1 ? ' & ' : ', ')}
                  <a href={item.href} target="_blank" rel="noopener noreferrer">{item.name}</a>
                </span>
              ))}
            </p>
            <div className="landing-actions">
              <a className="landing-cta" href={CALL} target="_blank" rel="noopener noreferrer">book a call <Arrow /></a>
              <div className="landing-social"><SocialIcons /></div>
            </div>
          </div>
        </ScrollVar>
      </WaveOpening>

      <section className="landing-proof stack" aria-labelledby="proof-title">
        <Reveal className="proof-head">
          <p className="landing-label">(02) By the numbers</p>
          <h2 id="proof-title">The work, in numbers.</h2>
        </Reveal>
        {proof.map((p, i) => (
          <Reveal key={p.label} className="proof-item" delay={i * 90}>
            <strong><CountUp value={p.value} decimals={p.decimals} suffix={p.suffix} /></strong>
            <span className="proof-bar" aria-hidden="true" />
            <p>{p.label}</p>
          </Reveal>
        ))}
      </section>

      <section id="what-i-built" className="landing-built stack">
        <Reveal className="built-head">
          <p className="landing-label">(03) Selected work</p>
          <h2>What I Built</h2>
          <p>Two products, each started from a problem I kept running into.</p>
        </Reveal>
        <div className="landing-projects">
          {highlights.map((h, i) => (
            <article key={h.label}>
              <Reveal className="project-visual">
                <ProjectVisual project={h.print} />
              </Reveal>
              <Reveal className="project-copy" delay={120}>
                <span className="project-num">0{i + 1} · {h.period}</span>
                <h3>{h.label}</h3>
                <p className="landing-role">{h.role}</p>
                <p className="project-desc">{h.desc}</p>
                <dl className="project-facts">
                  {h.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                </dl>
                <div className="landing-project-links">
                  <a className="pill" href={h.href} target="_blank" rel="noopener noreferrer">{h.linkLabel} <Arrow /></a>
                  {h.extraLinks?.map((link) => link.href.startsWith('/') ? (
                    <Link key={link.label} href={link.href}>{link.label}</Link>
                  ) : (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                  ))}
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section stack">
        <Reveal className="section-head">
          <p className="landing-label">(04) Consulting</p>
          <h2>Consulting</h2>
          <p>Hands-on engagements on retrieval, inference and evaluation, measured by what changed.</p>
        </Reveal>
        <div className="client-list">
          {consulting.map((c, i) => (
            <Reveal className="landing-client" key={c.company} delay={i * 80}>
              <span className="client-period">{c.period}</span>
              <strong>{c.company}</strong>
              <p>{c.impact}</p>
              <span className="client-metric">{c.metric}</span>
            </Reveal>
          ))}
          <Reveal className="landing-history">
            <span className="history-label">Before consulting</span>
            <ul>
              {prior.map((p) => (
                <li key={p.company}><b>{p.company}</b> {p.role}, {p.period}. {p.impact}.</li>
              ))}
            </ul>
            <Link href="/work">full history <Arrow /></Link>
          </Reveal>
        </div>
      </section>

      <section className="landing-section stack">
        <Reveal className="section-head">
          <p className="landing-label">(05) Writing</p>
          <h2>Writing</h2>
          <p>Field notes from the build: tokenizers, attention, MCP, and what broke along the way.</p>
          <div className="topic-chips">
            {topicCounts.map((t) => (
              <Link key={t.tag} href={`/tags/${t.tag}`}>#{t.tag}<sup>{t.count}</sup></Link>
            ))}
          </div>
        </Reveal>
        <div>
          <ul className="post-list">
            {posts.map((post, i) => (
              <Reveal as="li" key={post.path} delay={i * 60}>
                <Link href={post.path}>
                  <time dateTime={post.frontmatter.date}>{formatDate(post.frontmatter.date)}</time>
                  <span className="post-title">{post.frontmatter.title}</span>
                  <span className="post-meta">{post.readingTime}</span>
                  <Arrow />
                </Link>
              </Reveal>
            ))}
          </ul>
          <Link className="landing-all" href="/blog">all posts <Arrow /></Link>
        </div>
      </section>

      <section className="landing-close" id="contact">
        <HalftoneField variant="tide" />
        <div className="close-inner">
          <p className="landing-label">(06) Contact</p>
          <h2>Bring me the <em>hard</em> part.</h2>
          <p className="close-sub">Agents that forget, models that don’t speak your language, evals nobody has built yet. I’ve shipped my way through all three.</p>
          <div className="close-actions">
            <a className="landing-cta is-light" href={CALL} target="_blank" rel="noopener noreferrer">book a call <Arrow /></a>
            <a className="close-mail" href="mailto:sagar@quickcall.dev">sagar@quickcall.dev</a>
          </div>
        </div>
      </section>
    </div>
  );
}
