import Link from 'next/link';
import './landing.css';
import Image from 'next/image';
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
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-masthead hero-rise">
          <h1>Sagar <em>Sarkale</em></h1>
          <p>ai founder &middot; consultant &middot; engineer</p>
        </div>

        <div className="landing-art hero-rise hero-rise-2">
          <Image
            src="/indigo-curl.webp"
            width={1080}
            height={1080}
            preload
            alt="A breaking wave printed in coarse indigo halftone dots on ivory paper."
          />
        </div>

        <div className="landing-intro hero-rise hero-rise-2">
          <p className="landing-lead">
            I’m stubborn about what I want to make and pretty ruthless about what it doesn’t need.
            My favorite part is handing it to someone and getting to shut up while they use it.
          </p>
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
            <a className="landing-cta" href="https://calendar.app.google/z5J1gxmUkQ3vvzjT6" target="_blank" rel="noopener noreferrer">book a call &rarr;</a>
            <div className="landing-social"><SocialIcons /></div>
          </div>
        </div>
      </section>

      <section className="landing-built">
        <h2>What I Built</h2>
        <div className="landing-projects">
          {highlights.map((h) => (
            <article key={h.label}>
              <h3>{h.label}</h3>
              <span className="landing-status">{h.current ? 'current' : 'shipped ' + h.period}</span>
              <p className="landing-role">{h.role}</p>
              <p>{h.desc}</p>
              <div className="landing-project-links">
                <a href={h.href} target="_blank" rel="noopener noreferrer">{h.linkLabel}</a>
                {h.extraLinks?.map((link) => link.href.startsWith('/') ? (
                  <Link key={link.label} href={link.href}>{link.label}</Link>
                ) : (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2>Consulting</h2>
        <div>
          {consulting.map((c) => (
            <div className="landing-client" key={c.company}>
              <strong>{c.company}</strong><p>{c.impact}</p><span>{c.period}</span>
            </div>
          ))}
          <div className="landing-history">
            {prior.map((p) => <span key={p.company}>{p.company} ({p.period})</span>)}
            <span>&middot;</span><Link href="/work">full history</Link>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>Writing</h2>
        <div>
          <div className="landing-topics">
            {writingCards.map((card) => (
              <Link key={card.tag} href={`/tags/${card.tag}`}>
                <h3>#{card.title}</h3><span>{card.count} posts</span>
                <p>{card.desc}</p>
              </Link>
            ))}
          </div>
          <Link className="landing-all" href="/blog">all posts &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
