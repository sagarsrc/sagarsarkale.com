---
title: "[BLT#1] - Precursors to Byte Latent Transformer"
date: "2025-01-07"
summary: "Precursors to Byte Latent Transformer"
description: "Precursors to Byte Latent Transformer"
toc: true
readTime: true
autonumber: false
math: false
tags: ["GenAI", "BLT", "Transformers", "DeepDive"]
showTags: true
hideBackToTop: false
---

# Introduction

Recently Meta announced a tokenizer-free architecture called Byte Latent Transformer for language modelling, which for the first time, matches tokenizer-based LLM performance at scale with a significant breakthrough: using up to 50% fewer FLOPs during inference.

**What got me into this rabbit hole was the inference efficiency!**

Computational Costs Example (at $3/GPU hour):

- Running inference on large models like Llama 3 requires significant computational resources
- Each inference request needs to go through the entire model architecture
- For high-traffic applications, inference costs can quickly accumulate into millions of dollars

When we're talking about reducing inference FLOPs by up to 50%, we're not just discussing technical improvements - we're talking about making AI more economically viable for real-world applications.

These technical changes are not just about complexity reduction anymore. This is about the pure economic scale at which AI is operating today. More efficient inference means more accessible AI, lower operational costs, and potentially faster response times.

This is Part 1 of deep dive into Byte Latent Transformer where i will cover few concepts which are required to get into depths of this architecture and also provide a brief overview about this newly proposed architecture by Meta.

Before we dive deep, let's break down the key pieces required to learn this new architecture.

\*tokenizer-free: for this blog refers to byte based models which do not use tokenizers

# Think Bytes not Tokens

The fundamental difference between tokenizer-free architectures and token-based systems lies in their input processing and initialization.

Tokenizers need to be trained with multiple preprocessing steps on a large corpus to come up with a fixed set of vocabulary (~30K-50K items) for the model. In order to expand this vocabulary you need to re-train the tokenizer.

{{< figure src="/blt/000-tokenizer.png">}}

Whereas in case of Byte-based systems there is no concept of vocabulary as such, we need to map 256 combinations of 1s and 0s to an embedding space. The real tricky part in tokenizer-free systems is how do we make splits between the raw byte streams, more on that later.

{{< figure src="/blt/001-byte-based.png">}}

For now here are some major differences between these two systems:

| Aspect            | Token-based Systems (Sentence piece, BPE) | Token-Free Systems (BLT, MegaByte, SpaceByte) |
| ----------------- | ----------------------------------------- | --------------------------------------------- |
| Training Data     | Requires large corpus (>100GB)            | No pre-training data needed                   |
| Vocabulary Size   | 30,000-50,000 tokens                      | 256 bytes                                     |
| Vocabulary Growth | Grows with data/domains                   | Fixed size                                    |
| Representation    | Learned subword units                     | Raw UTF-8 bytes                               |
| Coverage          | Limited by training corpus                | Universal                                     |
| Memory Usage      | Higher (larger vocabulary)                | Lower (smaller vocabulary)                    |

**But how does using bytes instead of tokens make a difference?**

Traditional tokenizer-based Large Language Models (LLMs) learn a unique embedding for each token in their vocabulary, which can be as large as 50,000 tokens. In contrast, by using byte representations, you only need to learn 256 unique representations. This significantly reduces the memory usage of the model.

Moreover, when expanding the domain knowledge or multilingual capabilities of a traditional LLM, the tokenizer requires additional training. This training process also increases the size of the model's embedding layer.

By encoding words or sentences into their fundamental byte representations, the need for a tokenizer is eliminated altogether. This approach simplifies the process of extending the model's knowledge and multilingual capabilities without the overhead of tokenizer training and increased embedding layer size.

**Is this all that there is to using Bytes instead of Tokens in BLT?**

There are multiple architectural changes that have gone into this paper, which has resulted into significant results:

1. BLT matches performance of Llama3 model while using **50% lesser FLOPs** during inference
2. BLT dynamically allocates compute to improve FLOP efficiency
3. With BLT we can scale up model size while maintaining the same inference FLOP budget
4. BLT is less prone to noisy inputs than token-based LLMs

# Patching

**But before we dive into technicalities, let’s talk about this diagram for a bit.**

{{< figure src="/blt/002-byte-stream-parts.png">}}

Training of tokenizers inherently teaches them the patterns of words and subwords, so we exactly know where the splits will occur when we use a tokenizer, whereas what if you are given a series of integers as an input.

1. How will you decide on what the right partition (p1, p2, p3) is?
2. What makes a partition a right one?

This art of splitting long series of bytes into smaller groups / chunks is called **patching** and the formed groups are called **patches** in this paper, you use a **patching function** to get patches from byte stream.

Let us look into type of patching where each one falls short and how does BLT solve for patching in next few sections.

# Types of Byte Patching

## Fixed K Byte Patching

As the name suggests, after every K bytes we create a patch and move to creating next patch.

{{< figure src="/blt/003-fixed-patching.png">}}

- We can clearly see this leads to inconsistent and non-contextual patching of similar byte sequences - for example, the same word could be split differently in different contexts
- The fixed stride offers implementation simplicity and provides a straightforward mechanism for controlling FLOP cost, as patch size directly determines compute requirements
- A key limitation is that compute is not dynamically allocated - the model uses the same transformer computation step whether processing informational bytes (like the start of a word) or more predictable content (like whitespace or code)"

## Space-based Patching

Similarly here irrespective of the number of bytes each patch holds, you make a split where a space occurs.

{{< figure src="/blt/004-space-patching.png">}}

- This type of patching gives more coherent patching as words stay together and are segmented consistently across sequences
- However, it has limited control over patch size and therefore compute costs, as patch lengths vary based on word lengths
- While it naturally allocates compute for harder predictions (like first bytes after spaces), it cannot gracefully handle all languages and domains

Below is a more comprehensive table, listing down strengths and limitations of fixed size and space based patching.

## Pros of Fixed K-size and Space-based Patching

| Aspect           | Fixed K-size Patching                                                                              | Space-based Patching                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| _Implementation_ | Simple fixed-size windows make implementation straightforward{{<linebreak>}}(e.g 16, 32, 64 bytes) | Simpler implementation than fixed size patching{{<linebreak>}}(e.g just split on the byte that represents \<space\>) |
| _Control_        | Can easily switch between patch sizes (16->32->64) based on hardware constraints                   | Coherent splitting of bytes{{<linebreak>}}(e.g maintains meaningful byte sequences)                                  |
| _Performance_    | Predictable compute cost{{<linebreak>}}(e.g 1M tokens = exactly 62.5K patches of size 16)          | Natural breaks in byte sequences guide the splitting                                                                 |

## Cons of Fixed K-size and Space-based Patching

| Aspect                | Fixed K-size Patching                                                                                                  | Space-based Patching                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _Resource Usage_      | Same resources for both simple and complex sequences                                                                   | Cannot control patch size for optimization                                                                                                              |
| _Sequence Processing_ | Might split semantically related byte sequences incorrectly                                                            | Variable computational overhead between patches                                                                                                         |
| _Compatibility_       | Inconsistent handling of non-contiguous similar byte sequences                                                         | Not all languages and domains are handled effectively                                                                                                   |
| _Predictability_      | Semantic units split across patches affect prediction accuracy {{<linebreak>}}(e.g "this boo", "k was wr", “itten by”) | Prediction after certain sequences with punctuations might affect prediction accuracy{{<linebreak>}}(e.g "who wrote xyz book?\<space\>" → "?\<space\>") |

NOTE : there are other patching schemes/ functions like BPE, CNN based patching which are not discussed in this blog as they are slightly out of scope.

# Entropy based Patching

Now that we have seen few types of patching, let's look into how BLT solves for patching. Instead of using rule based patching, BLT relies on a more data driven approach for patching.

<diagram and explanation>

<advantages and disadvantages>

# Code example of Entropy Patching

<code>

What is tokenizer free architecture?

- Why is Byte Latent Transformer so big a deal?
- Context window and how does it differ in BLT?
- If not tokens then how do we get embeddings?
- Create a need for better mechanism - can we do better?
- types of patching - Techniques of splitting words into bytes
- Entropy based patching?\*
- Give Code example
- Show overview diagram in the paper
