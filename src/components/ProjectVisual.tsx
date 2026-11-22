/**
 * Product visuals for the "What I built" rows. Lines and chips animate in once
 * their parent `.reveal` gains `is-in`; without JS they render static.
 */

const sentence = ['मला', 'मिसळ', 'खूप', 'आवडते'];

function QuickCallTerminal() {
  const lines: { cls: string; text: string; sub?: string }[] = [
    { cls: 'prompt', text: 'refactor payment retry to handle idempotency' },
    { cls: 'tool', text: 'Reading payment-retry.ts, stripe-client.ts' },
    { cls: 'qc', text: 'quickcall found 2 patterns in team context' },
    { cls: 'pick', text: 'Wrap Stripe calls in idempotency guards', sub: '94% of prod errors came from retries without keys' },
    { cls: 'opt', text: 'Use Decimal for currency math' },
  ];
  return (
    <figure data-parallax="-0.07" className="pv pv-term" aria-label="QuickCall surfacing team context inside a Claude Code session">
      <div className="pv-bar">
        <span /><span /><span />
        <em>~/billing-engine — claude code</em>
      </div>
      <ol className="pv-lines">
        {lines.map((l, i) => (
          <li key={l.text} className={`pv-${l.cls}`} style={{ '--n': i } as React.CSSProperties}>
            <span className="pv-text">{l.text}</span>
            {l.sub && <span className="pv-sub">{l.sub}</span>}
          </li>
        ))}
      </ol>
      <div className="pv-status">
        <span className="pv-dot" /> team memory loaded
      </div>
    </figure>
  );
}

function MisalTokens() {
  const seg = new Intl.Segmenter('mr', { granularity: 'grapheme' });
  const bytes = sentence.flatMap((w) => Array.from(seg.segment(w), (g) => g.segment));
  return (
    <figure data-parallax="-0.07" className="pv pv-tok" aria-label="The same Marathi sentence split by a byte-level tokenizer and by Misal's tokenizer">
      <p className="pv-sentence" lang="mr">मला मिसळ खूप आवडते</p>
      <p className="pv-gloss">“I really love misal.”</p>
      <div className="pv-row">
        <span className="pv-label">Llama tokenizer <b>{bytes.length}+</b></span>
        <div className="pv-chips is-many" lang="mr">
          {bytes.map((c, i) => <span key={i} style={{ '--n': i } as React.CSSProperties}>{c}</span>)}
        </div>
      </div>
      <div className="pv-row">
        <span className="pv-label">Misal tokenizer <b>{sentence.length}</b></span>
        <div className="pv-chips" lang="mr">
          {sentence.map((w, i) => <span key={w} style={{ '--n': i * 3 + 8 } as React.CSSProperties}>{w}</span>)}
        </div>
      </div>
      <figcaption>Illustrative split. Stock Llama spent 3–5× more tokens on Marathi.</figcaption>
    </figure>
  );
}

export function ProjectVisual({ project }: { project: 'quickcall' | 'misal' }) {
  return project === 'quickcall' ? <QuickCallTerminal /> : <MisalTokens />;
}
