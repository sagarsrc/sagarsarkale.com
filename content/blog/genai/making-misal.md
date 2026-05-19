---
title: "Making Misal — India's First Competitive Marathi LLM"
date: "2024-04-13"
summary: "How we built Misal 7B/1B — pretraining, custom tokenizer, instruction tuning, and evals for a Marathi-first language model."
description: "How we built Misal 7B/1B — pretraining, custom tokenizer, instruction tuning, and evals for a Marathi-first language model."
toc: false
readTime: true
tags: ["DeepDive"]
showTags: true
hideBackToTop: false
cover: "/og/blog/genai/making-misal.png"
---

> Originally published on **smallstep.ai** on April 13, 2024. Read the full post here:
> [**smallstep.ai/making-misal**](https://smallstep.ai/making-misal)

# Overview

Misal is India's first competitive Marathi LLM — 7B and 1B parameter models pretrained and finetuned on ~2B Marathi tokens, with a custom SentencePiece tokenizer that fixes Llama's 3–5x token inefficiency on Devanagari script.

Highlights:

- **Custom tokenizer** — 15K Marathi tokens added to Llama's vocabulary, cutting tokens-per-word 3–5x
- **Pretraining** — 2B Marathi tokens on A100, LoRA-based continued pretraining of Llama2 7B/1B
- **Instruction tuning** — 200K Marathi instructions curated from Alpaca translations + IndicQuestionGeneration
- **Eval** — beat GPT-3.5 on Marathi reading comprehension benchmarks
- **Open-sourced** — [models on Hugging Face](https://huggingface.co/smallstepai), tokenizer, pretraining configs, and eval framework

# Read the full write-up

The complete technical breakdown — data curation, tokenizer training, pretraining recipe, finetuning, and evals — lives on the smallstep.ai site:

➜ [**smallstep.ai/making-misal**](https://smallstep.ai/making-misal)

# Coverage

- [YourStory — For the love of Misal](https://yourstory.com/2024/05/for-the-love-of-misal-smallstepai-is-building-an-llm-for-marathi)
- [Moneycontrol — Bootstrapped AI startup smallstep serves up Misal](https://www.moneycontrol.com/news/technology/bootstrapped-ai-startup-smallstep-serves-up-misal-a-marathi-llm-12693311.html)
- [ARB Podcast (YouTube)](https://www.youtube.com/watch?v=YHVFgb0RTVg)
- Launch: [LinkedIn](https://www.linkedin.com/posts/sagar-sarkale_misal-activity-7184874193405038594-lgkE), [Twitter/X](https://x.com/smallstepai/status/1779108646263423307)
