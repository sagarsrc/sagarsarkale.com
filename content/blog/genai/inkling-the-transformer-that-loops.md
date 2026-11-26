---
title: "Inkling — the transformer that loops"
date: "2026-11-26"
summary: "One block, three visits, forty-eight layers deep."
description: "Inkling 2 Mini and loop transformers explained intuitively — recurrence is back, this time over depth."
toc: true
readTime: true
autonumber: true
math: true
tags: ["Foundations", "Transformers", "DeepDive"]
showTags: true
hideBackToTop: false
---

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/inkling/01-cover.png">}}

In my previous blogs we saw how [RNNs](https://sagarsarkale.com/blog/seq/rnns-a-walkthrough/) looped the **same cell** over time, how [LSTMs](https://sagarsarkale.com/blog/seq/lstm-simplified/) learned to control that loop with gates, and how [transformers](https://sagarsarkale.com/blog/genai/patience-is-all-you-need/) threw the loop away entirely — every token processed in parallel, every layer with its own weights. That trade gave us the modern era.

On **20 November 2026**, Thinking Machines Lab shipped **Inkling 2 Mini**, and the loop came back. Not over time — over **depth**. One shared block of layers, visited three times by every token, before the token is allowed to exist.

Personally, the small `Nx` in the transformer diagram always bugged me. "Just repeat this block N times" — sure, but why does each repetition need its **own** weights? What if the same block could look at its own work and take another pass? That is exactly what Inkling does, and in this blog we will open it up piece by piece.

> 💡 **Too long; won't read:** Inkling 2 Mini stores 24 layers but executes 48 layer-applications per token — a 12-layer "core" block reused 3 times. Same weights, fresh state, learned notes passed between visits. It thinks twice (well, thrice) before it speaks.

# Three ways to spend compute

Before the architecture, let us build the intuition. If you are a lab (or a leadership team) deciding how to make a model better, you are really choosing between three budgets:

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/inkling/02-three-compute-budgets.png" caption="Three budgets for making models better" width="80%" height="auto">}}

1. **Capacity** — more unique parameters. More facts, more procedures, more storage. This is what MoE scales cheaply: huge weight count, only a slice active per token.
2. **Recurrent depth** — more sequential transformations of the same hidden state. Not more storage — more *manipulation* of what is already represented. This is what looping scales.
3. **Visible reasoning** — more generated tokens. Chain-of-thought. The model literally writes its intermediate work where you can read it.

Every "our model is smarter now" announcement is spending on one or more of these axes. They are not interchangeable: capacity buys knowledge, depth buys manipulation, visible reasoning buys inspectability. Keep this triangle in mind — everything Inkling does is a bet on axis #2.

> 💡 **Leadership takeaway:** when a vendor says "smaller model, same performance", always ask *which budget was held fixed*. Stored weights, inference FLOPs, latency and quality are four different numbers.

# The loop, precisely

Time for the primitive of this post — like "The Gate" was for LSTMs. Everything else is decoration on top of this one idea.

An ordinary transformer stack computes:

$$h_{l+1} = F_{\theta_l}(h_l)$$

Every depth $l$ has its **own** parameters $\theta_l$. A 48-layer model stores 48 different sets of weights. A loop transformer computes:

$$s_{r+1} = R_\theta(s_r), \qquad r = 0, \ldots, K-1$$

The **same** $\theta$ at every step. Store one block, apply it $K$ times, get $K$ times the effective depth.

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/inkling/03-loop-anatomy.png" caption="Three distinct layers vs one block visited three times" width="80%" height="auto">}}

Now the part that matters, and where most explanations go wrong:

> 💡 This is recurrence over **depth**, not over **time**. In an RNN, token $t$ waited for token $t-1$ — that is why training could not parallelize. In a loop transformer, all tokens still move through the block **in parallel**. What is serial is the loop itself: visit $r+1$ needs the state produced by visit $r$. The old RNN bottleneck did not disappear — it moved to a different dimension and got much shorter (3 steps, not 10,000).

If you remember one line from my RNN blog — *"it is the same cell we see at every timestep"* — replace "timestep" with "visit" and you already understand loop transformers. The rest of this post is how Inkling wires it.

# Some notations before we begin

| Symbol | Meaning |
|---|---|
| $P$ | **Prelude** — first 6 layers, run once. Encodes the problem. |
| $e$ | **Saved state** — hidden state right after the prelude. Snapshotted. |
| $R_\theta$ | **Core** — 12 shared layers, visited $K=3$ times. |
| $s_r$ | Hidden state at visit $r$. |
| $C$ | **Coda** — last 6 layers, run once. Turns state into logits. |
| $K$ | Number of visits. Fixed at 3 for Inkling 2 Mini. |
| $m_r$ | **Messages** — learned notes passed from visit $r$ to visit $r+1$. |

The full pipeline, mathematically:

$$e = P(x), \qquad s_{r+1} = R_\theta(s_r, e, m_r), \qquad y = C(s_K)$$

Prelude encodes, core iterates, coda speaks. Simple skeleton — but the wiring inside $R$ is where Inkling gets interesting.

# Opening the loop — inside Inkling 2 Mini

Here is the complete path of a single token. Take a breath, look at the diagram, and then we walk it visit by visit.

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/inkling/04-inkling-cutaway.png" caption="Inkling 2 Mini: 24 stored layers, 48 layer-applications per token" width="90%" height="auto">}}

## The map

Inkling 2 Mini stores **24 decoder layers**:

- layers 0–5: **prelude**, executed once
- layers 6–17: **core**, executed three times
- layers 18–23: **coda**, executed once

$$6 + 3 \times 12 + 6 = 48 \text{ layer-applications per token}$$

The model card reports **26.4B total parameters, 3.4B unique active**. You will see "5.4B effective active" floating around — that is the 3.4B plus the repeated re-reads of the shared core at 3 visits. It is an *operation count*, not extra stored weights. First lesson of reading loop-transformer marketing: stored bytes and executed FLOPs are different currencies.

## Visit #1

The token enters the prelude, and the prelude does something unusual: after layer 5, the hidden state is **snapshotted**. Call it $e$ — the encoded problem statement.

Then the core runs for the first time: 12 layers of attention + MoE over $e$. Hidden width 2304, 128 routed experts with top-8 routing, full attention at layers 5, 11, 17 and 23. The output of visit #1 is $s_1$ — a first draft of "thinking".

In a naive loop design, $s_1$ would feed straight back in. Inkling does something subtler.

## The restart

> 💡 **The surprise:** visits #2 and #3 do **not** continue from the previous visit's output. They **restart from the saved state $e$** — the post-prelude snapshot — and receive the previous visit's work only as *messages*.

Think of it like re-attempting a problem from the original question each time, while keeping your previous attempt's margin notes — not continuing to scribble on top of the old attempt. This keeps every visit anchored to the actual problem and prevents errors from compounding through chained states.

## The messages

So what are these margin notes? At every core layer, **4 learned query vectors** attend over the previous visit's block-boundary states (plus its final state) and produce messages — separate ones for the **Q, K, V, and MoE** inputs of the current visit.

Each message is merged with the current state through a **gated mix**:

$$\text{updated} = \underbrace{(1 - \tanh(f))}_{\text{keep current}} \cdot \; \text{current} \; + \underbrace{\tanh(m)}_{\text{take message}} \cdot \; \text{message}$$

where $f$ and $m$ are small rank-64 learned projections. If your LSTM senses are tingling — they should be. This is a forget gate. The same $\tanh$-squashed knob that decided what to remember in a cell state now decides how much of the *previous visit's notes* to let into the *current visit*. The gates escaped the cell and got promoted to depth.

The gates reportedly start closed and open during training — the model literally learns *how much* to listen to its previous attempt.

## What does NOT loop

Here is where "shared weights" stops sounding free. Two things re-run fresh on every visit:

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/inkling/05-shared-vs-fresh.png" caption="Shared across visits vs fresh per visit" width="80%" height="auto">}}

1. **Routing.** The MoE router re-decides expert assignment on every visit. A token can consult different experts on visit #2 than it did on visit #1 — same weights, different path through them.
2. **Cache state.** Each logical layer-application keeps its **own KV cache and convolution state** — 48 logical cache slots, not 24. Shared weights do **not** mean shared memory. At long context, Inkling's weight savings do not translate into proportional KV savings.

> 💡 **Leadership takeaway:** "26B model" is the *storage* number. It still executes 48 layer-applications and keeps 48 layers' worth of cache per token. Compute, latency and memory bandwidth did not shrink by 3×. Only the weights did.

# Wait — which Inkling loops?

This needs its own section, because the internet got it wrong within hours of release.

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/inkling/06-version-matrix.png" caption="Only one Inkling loops" width="80%" height="auto">}}

| Model | Loops? | Architecture |
|---|---|---|
| Original Inkling | ❌ No | 66-layer conventional sparse MoE, 975B total / 41B active |
| Inkling 2 Small | ❌ No | 48-layer conventional MoE, 594B / 17B |
| **Inkling 2 Mini** | ✅ **Yes, ×3 fixed** | 24 layers → 48 applications, 26.4B / 3.4B |
| `TML-d24-varloop-research` | ✅ **×1–5, caller's choice** | Same topology, trained across depths |

The first two are ordinary, if very good, transformers. The Mini is the looped one. And that last row is the quiet gem: an open research checkpoint where **you** pick the number of visits at inference time. It was trained with passes sampled 1:2:6:2:1 (so it saw 3 most often), and it turns "how many times should the model think about this?" into a runtime dial.

# Does looping actually work?

Everything above is mechanism — source-verified in the public config and the Transformers implementation. Everything below is **vendor-reported**, not independently reproduced. With that honesty up front:

**Looped beats unlooped at matched compute.** Thinking Machines trained a non-looped sibling and compared at equal executed compute: the looped variant won **27 of 28 evaluations**, with a compute-equivalent gain of **1.51–1.91×**. The non-loop variant needed **140% more inference compute** to match the looped loss on agentic traces.

**More visits help — then stop helping.** The varloop checkpoint is the cleanest evidence, because the *same weights* run at different depths:

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/inkling/07-passes-vs-capability.png" caption="Vendor-reported: capability vs number of visits" width="80%" height="auto">}}

- Reasoning, agentic and long-context tasks improve sharply from 1 → 3 visits.
- At 4–5 visits, gains flatten, wobble, or regress.
- Recall-heavy tasks barely move at any depth. Loops help *manipulation*, not *storage* — exactly what the three-budgets picture predicted.

**Loops eat chain-of-thought.** At matched accuracy, mean reasoning tokens went **3,703 → 1,731 → 1,661** at 1, 3 and 5 visits. The "thinking" migrates from visible tokens into hidden iterations. On a no-CoT task suite, the effective task horizon stretched from 16 to 37 "human-seconds" between 1 and 3 visits.

> 💡 **Leadership takeaway:** same accuracy with ~half the visible reasoning tokens means cheaper and faster agents. But it also means the model's reasoning is no longer written down anywhere you can read it. More on that in a moment.

# What the hype hides

Let us be the adults in the room, because the headlines will not be.

**Parameter efficiency ≠ compute efficiency.** Looping a block three times stores it once and *executes* it three times. The latency of 48 serial layer-applications is the latency of 48 serial layer-applications. Smaller resident weights help bandwidth-bound decoding, and shorter chains-of-thought reduce total task time — but per-token compute goes *up*, not down.

**More loops is not a dial to infinity.** Benefits saturate at 2–4 visits and can reverse. A model trained across 1–5 visits is not licensed to run at 50. Depth extrapolation is learned behavior, not a theorem.

**The RNN ghost.** Visit $r+1$ needs visit $r$'s state. That dependency cannot be parallelized away — the exact same wall that ended the RNN era, now over depth. It is a much shorter wall (3 steps), but it is load-bearing: loop transformers will always pay a serial tax that an untied deep model does not.

**Oversight tension.** Chain-of-thought's one undeniable virtue is that you can *read* it. Every unit of reasoning that moves into latent iterations is a unit of reasoning your safety tooling cannot see. Thinking Machines reports "no detected decline in monitorability" — which is careful, honest phrasing for *we looked and didn't find anything*, not *there is nothing to find*.

**Evidence maturity.** Topology and wiring: verified in public code. Quality, speed, and monitorability numbers: vendor experiments, valuable but unreproduced. The honest summary is "real architecture, promising early numbers, jury still out".

# End note

Here is the whole post in one picture:

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/inkling/08-summary.png" caption="Loop transformers in one view" width="70%" height="auto">}}

And in one paragraph: RNNs looped one cell over **time**, and we loved them until the serial dependency became unbearable. Transformers unrolled the loop, gave every layer its own weights, and parallelized everything. Inkling loops one block over **depth** — restarting from a saved snapshot, passing gated notes between visits, re-routing experts every time — and gets 48 layers of thinking out of 24 layers of storage. Recurrence never died. It just moved to a dimension where 3 steps of serial dependency is a price worth paying.

The `Nx` in the diagram finally makes sense to me. I hope it does to you now as well!

Happy learning!

# References

1. [Inkling 2 Mini — Thinking Machines Lab](https://thinkingmachines.ai/news/inkling-2-mini/) — the announcement that started it all
2. [Inkling 2 Mini model card + config](https://huggingface.co/thinkingmachines/Inkling-2-Mini) — where the 6 + 3×12 + 6 arithmetic lives
3. [Transformers `inkling2_loop` implementation](https://github.com/huggingface/transformers/blob/main/src/transformers/models/inkling2_loop/modeling_inkling2_loop.py) — restart semantics and message gating, in code
4. [`TML-d24-varloop-research` checkpoint](https://huggingface.co/thinkingmachines/TML-d24-varloop-research) — the 1–5 visit dial, open weights. Huge shoutout for shipping this
5. [Scaling Test-Time Compute with Latent Reasoning (Geiping et al.)](https://arxiv.org/abs/2502.05171) — 3.5B recurrent-depth model, the February 2025 catalyst
6. [Reasoning with Latent Thoughts (Saunshi et al.)](https://arxiv.org/abs/2502.17416) — loops help reasoning far more than recall
7. [Ouro](https://arxiv.org/abs/2510.25741) — open 1.4B/2.6B looped models on 7.7T tokens
8. [Universal Transformer (Dehghani et al., 2018)](https://arxiv.org/abs/1807.03819) — the clearest ancestor; gold standard of "this idea is older than you think"
9. [Adaptive Computation Time (Graves, 2016)](https://arxiv.org/abs/1603.08983) — where learned halting began
10. [Sparse Layers Are Critical (IsoFLOP study)](https://arxiv.org/abs/2605.09165) — the counterresult that keeps everyone honest

{{<author>}}
