---
title: "[BLT#1] - Precursors to Byte Latent Transformer"
date: "2025-01-07"
summary: "Precursors to Byte Latent Transformer"
description: "Precursors to Byte Latent Transformer"
toc: true
readTime: true
autonumber: false
math: true
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

{{< figure src="/blt1/000-tokenizer.png">}}

Whereas in case of Byte-based systems there is no concept of vocabulary as such, we need to map 256 combinations of 1s and 0s to an embedding space. The real tricky part in tokenizer-free systems is how do we make splits between the raw byte streams, more on that later.

{{< figure src="/blt1/001-byte-based.png">}}

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

{{< figure src="/blt1/002-byte-stream-parts.png">}}

Training of tokenizers inherently teaches them the patterns of words and subwords, so we exactly know where the splits will occur when we use a tokenizer, whereas what if you are given a series of integers as an input.

1. How will you decide on what the right partition (p1, p2, p3) is?
2. What makes a partition a right one?

This art of splitting long series of bytes into smaller groups / chunks is called **patching** and the formed groups are called **patches** in this paper, you use a **patching function** to get patches from byte stream.

Let us look into type of patching where each one falls short and how does BLT solve for patching in next few sections.

# Types of Byte Patching

## Fixed K Byte Patching

As the name suggests, after every K bytes we create a patch and move to creating next patch.

{{< figure src="/blt1/003-fixed-patching.png">}}

- We can clearly see this leads to inconsistent and non-contextual patching of similar byte sequences - for example, the same word could be split differently in different contexts
- The fixed stride is simpler to implement and provides a straightforward mechanism for controlling FLOP cost, as patch size directly determines compute required
- A key limitation is that compute is not dynamically allocated - the model uses the same transformer computation step whether processing informational bytes (like the start of a word) or more predictable content (like whitespace or punctuations)

## Space-based Patching

Similarly here irrespective of the number of bytes each patch holds, you make a split where a space occurs.

{{< figure src="/blt1/004-space-patching.png">}}

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

## What is Entropy mathematically?

Now that we have seen few types of patching, let's look into how BLT solves for patching. Instead of using rule based patching, BLT relies on a more data driven approach for patching.

Taken from the paper:

> We train a small byte-level auto-regressive language model on the training data for BLT and compute next byte entropies under the LM distribution $p_e$ over the byte vocabulary $\mathcal{V}$:
>
> $$H(x_i) = \sum_{v\in\mathcal{V}} p_e(x_i = v|x<i) \log p_e(x_i = v|x<i)$$

Let's break down this equation:

- $H(x_i)$ is the entropy of the next byte $x_i$
- $p_e(x_i = v|x<i)$ is the probability of the next byte $x_i$ being $v$ given the previous bytes $x<i$
- $\log p_e(x_i = v|x<i)$ is the log probability of the next byte $x_i$ being $v$ given the previous bytes $x<i$

Entropy is a measure of the uncertainty or randomness of a probability distribution. In this case, it measures the uncertainty of the next byte in the sequence given the previous bytes.

## Why is Entropy important in patching?

Imagine you are talking to your friend on a call and you start the conversation with "Hello, how are you?" And your friend responds with one of the following:

1. "Hello, I'm great!"
2. "Flying Elephants in the zoo are very cute!"

Which of the above responses is more surprising?
I think we all agree that the second response is more surprising, and extremely unlikely to be the response to the question "Hello, how are you?".

Using entropy equation we have a measure of quantifying this randomness. The way we know a certain sentence or a set of words is totally random in the same manner we can quantify how random a certain byte sequence is.

## How does Entropy intuition translate into patching?

Researchers trained a small model to predict degree of randomness of the next byte given a byte sequence. So let's try to visualize and understand how this entropy model works with a diagram.

`"I walked to the store and bought a book"`.
{{< figure src="/blt1/005-entropy-diagram-1.0.png">}}

Key components of diagram:

- **Blue Line**: Shows entropy values for each byte/character
- **Red Dashed Line**: Represents the entropy threshold
- **Green Dotted Line**: Shows the average entropy
- **Red Dots**: Marks high entropy points (peaks) where entropy exceeds the threshold
- **Y-axis**: Measures entropy is in bits
- **X-axis**: Individual bytes converted to characters in the sentence

Let's look more closely at this diagram now:
{{< figure src="/blt1/005-entropy-diagram-1.1.jpeg">}}

You can see that after every word there is a spike in entropy. And as you progress through a certain word, the entropy decreases gradually. **A word can be bounded by dashed lines can be considered as a patch**.

Similarly you can notice abnormalities in entropy values when you look at some unusual words and symbols in sentences, like `"I WALKED to the store and bought @ BOOK!"` in the diagram below.

{{< figure src="/blt1/006-entropy-diagram-2.png">}}

**Methods mentioned in the paper for patching**

1. Global Constraint

   - Here you use a global threshold to determine a patch boundary
   - In the above diagram you can see that the threshold is being set to some value in red dashed lines
   - Every Red dot above the threshold marks the start/end of a patch
   - Mathematically it can be represented as
   - $$H(x_t) > \theta_{g}$$

2. Approximate Monotonic Constraint
   - Here you use a monotonic constraint to determine a patch boundary
   - This constraint tries to answer if the entropy is consistently decreasing or not across the sequence
   - Mathematically it can be represented as
   - $$H(x_t) - H(x_{t+1}) > \theta_{r}$$

**NOTE**: All the diagrams below have different entropy values and thresholds, this is because the model is trained on a slightly larger dataset.

# Let's patch!

## Patching with a simple model

Let's try to see what patches are created using these methods seen in the previous section.
I trained a small model (ngram model with n=2) here to predict entropy of the next byte given a byte sequence, and plotted the patches created using global constraint method and approximate monotonic constraint method.

{{< figure src="/blt1/008-patches-1.png">}}

{{< details "Outputs Global Threshold Patches" >}}

```
Patch 1: 'I ' (2 bytes)
Patch 2: 'w' (1 bytes)
Patch 3: 'alked ' (6 bytes)
Patch 4: 't' (1 bytes)
Patch 5: 'o ' (2 bytes)
Patch 6: 't' (1 bytes)
Patch 7: 'he ' (3 bytes)
Patch 8: 's' (1 bytes)
Patch 9: 'tore ' (5 bytes)
Patch 10: 'a' (1 bytes)
Patch 11: 'nd ' (3 bytes)
Patch 12: 'b' (1 bytes)
Patch 13: 'ought ' (6 bytes)
Patch 14: 'a' (1 bytes)
Patch 15: ' ' (1 bytes)
Patch 16: 'b' (1 bytes)
Patch 17: 'ook.' (4 bytes)
```

{{< /details >}}

{{< details "Outputs Approximate Monotonic Constraint Patches" >}}

```
Monotonic Constraint Patches:
Patch 1: 'I' (1 bytes)
Patch 2: ' ' (1 bytes)
Patch 3: 'wal' (3 bytes)
Patch 4: 'ke' (2 bytes)
Patch 5: 'd ' (2 bytes)
Patch 6: 'to' (2 bytes)
Patch 7: ' ' (1 bytes)
Patch 8: 'th' (2 bytes)
Patch 9: 'e' (1 bytes)
Patch 10: ' ' (1 bytes)
Patch 11: 'stor' (4 bytes)
Patch 12: 'e' (1 bytes)
Patch 13: ' ' (1 bytes)
Patch 14: 'and ' (4 bytes)
Patch 15: 'bo' (2 bytes)
Patch 16: 'u' (1 bytes)
Patch 17: 'gh' (2 bytes)
Patch 18: 't' (1 bytes)
Patch 19: ' ' (1 bytes)
Patch 20: 'a ' (2 bytes)
Patch 21: 'bo' (2 bytes)
Patch 22: 'o' (1 bytes)
Patch 23: 'k.' (2 bytes)
```

{{< /details >}}

If you closely look at the outputs of both monotonic and global threshold patching, you can see that the patches created are varying in size, but they are not coherent.

## But why Patch with entropy?

**So what did we even achieve here, with entropy based patching?**

While the previous outputs may not have provided complete clarity, here is another interesting result worth considering!
Input sentence: `"Sherlock Holmes is a smart detective."`
{{< figure src="/blt1/008-patches-2.png">}}

- Notice how the word `"Sherlock Holmes"` is being combined into a single patch, this is because the entropy values are very low for the word `"Sherlock Holmes"` and the bytes forming this word frequently occur together in the corpus.
- This is a good example of how entropy based patching can create coherent patches, even for complex words.
- This fairly proves the point that breaking down sentences into coherent patches is possible with entropy based patching
- This also proves the point that extending the domain knowledge of the model is possible with this type of patching.

Entropy values diagram for the above sentence are shown below.

{{< figure src="/blt1/008-patches-3.png">}}

**NOTE**: This result was obtained using a better next byte entropy prediction model using 3,4,5-gram models.

# End Note

Additionally, this paper uses smart hacks to convert these dynamic patches to embeddings. It was important to establish the fact that patches of dynamic sizes can be created with entropy based patching, and this can be achieved with simple models. The entropy based patching model serves as an essential building block for BLT to achieve it's performance.

{{< figure src="/blt1/009-we-are-here.jpeg">}}

Well, we are just getting started, the next blog will cover how these patches are converted to embeddings and how BLT, and how the inputs for the model are generated. It is going to be fun!

# Appendix

All the code used for generating diagrams and artifacts in this blog are available on github below:

- https://github.com/another-learning-experiment/concept-deep-dive

I will be maintaining this repo for this blog and the upcoming ones. Feel free to experiment with the code and share your thoughts.

# References

1. [Byte Latent Transformer Research Paper](https://arxiv.org/pdf/2412.09871)

---

Written By

> Sagar Sarkale
