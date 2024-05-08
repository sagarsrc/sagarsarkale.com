---
title: "Position Encoding in Transformers"
date: 2024-04-25T18:26:32+0000
weight: 100
# aliases: ["/first"]
author: "Sagar Sarkale"
showToc: true
TocOpen: true
TocSide: "left"
draft: false
hidemeta: false
comments: false
description: "How do you understand position of token in transformer?"
canonicalURL: "https://canonical.url/to/page"
disableShare: false
hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
math: katex
tags: ["Transformers", "DeepLearning"]
cover:
  image: "https://imgur.com/5NJBndS.png" # image path/url
  alt: "Position Encoding in Transformers" # alt text
  caption: "<text>" # display caption under cover
  relative: false # when using page bundles set this to true
  hidden: false # only hide on current single page
editPost:
  URL: "https://github.com/<path_to_repo>/content"
  Text: "Suggest Changes" # edit text
  appendFilePath: true # to append file path to Edit link
---

# Introduction

Positional encoding is a small concept in Transformer architecture, yet of crucial importance. In RNNs or LSTMs we pass a tokens in a sequential manner, here information of "order" is inherently captured.

Whereas in case of Transformers we pass multiple tokens at the same time, they are more likely lose out on positional information of tokens. As we are feeding tokens parallely we need to use some mechanism to remember the "order" of the tokens being fed to the transformer. Hence Positional Encoding.

Why position matters?

1. "the cat was chasing the mouse in the house"
2. "the mouse was chasing the cat in the house"

As we can see by swapping 2 words in the sentence, whole meaning changes.

# Goal

Model uses these words as embeddings, our goal is to make these embeddings carry additional position information, here the corresponding index associated with each word.

{{< figure src="/pos-enc/000-words-to-emb-pos.png" height="300">}}

# Proposed method

Authors of ["Attention Is All You Need"](https://arxiv.org/abs/1706.03762) propose a novel method for encoding positional information. Below is the formulation.

$$ PE\_{(pos,2i)} = sin({pos}/{{10000}^{{2i}/{d}}})$$

$$ PE\_{(pos,2i+1)} = cos({pos}/{{10000}^{{2i}/{d}}})$$

Understanding variables:

| variable           | meaning                      |
| ------------------ | ---------------------------- |
| $w_0, w_1, .. w_n$ | Words/ tokens in sequence    |
| $i$                | Index of embedding dimension |
| $pos$              | position of word in sequence |
| $d$                | embedding dimension of model |

{{< figure src="/pos-enc/003-pos-and-i-desc.png" height="250">}}
{{< figure src="/pos-enc/002-pos-enc-add.png" height="250">}}

$$fig\ 1$$

This position embedding is further added with the word embedding as shown above.
Let us try to understand what extra information does the orange vector add to word embeddings.

# Breaking down Math

## step 1 - formula

As we can see here there are two operations being performed on even index of embedding dimension for a given position. All even indices are some function of sine and odd indices are some function of cosine.

$$ PE\_{(pos,2i)} = sin(\theta)$$

$$ PE\_{(pos,2i+1)} = cos(\theta)$$

Where $\theta$ is a function of $pos$ and $i$

$$ \theta = {pos}/{{10000}^{{2i}/{d}}} $$
$$ \theta = {pos} \* {1}/{{10000}^{{2i}/{d}}}$$

- $pos$ is just a multiplying factor
- whereas division term ${1}/{{10000}^{{2i}/{d}}}$
- it a decaying function which ranges between $(0,1]$

## step 2 - division term

Let us try to plot this division term.
$${1}/{{10000}^{{2i}/{d}}}$$

{{<figure src="https://imgur.com/sygcNso.png">}}
$$fig\ 2$$

## step 3 - offset

On multiplying $pos$ term with division term.
$$ \theta = {pos} \* {1}/{{10000}^{{2i}/{d}}}$$

{{<figure src="https://imgur.com/w0IsYR7.png">}}
$$fig\ 3$$

Notice how each word's position starts from a different point on y axis.

## step 4 - even/odd $i$

Now for each even index applying sine function, and for each odd index applying cosine function.

$$ PE\_{(pos,2i)} = sin(\theta)$$

$$ PE\_{(pos,2i+1)} = cos(\theta)$$
{{<figure src="https://imgur.com/a4nFl5M.png">}}

$$fig\ 4$$

- One interesting thing to note here is how all even indices of at every position converge to **0**
- Similarly all the odd indices at every position converge to **1** as we go deeper in the dimension (as $i$ increases)

Now let us put all these steps together and see how position embedding varies when we combine both even and odd index values

## step 5 - oscillation

This Plot tells us how value of position encoding varies across dimension $i$ for each word at position $pos$. We can clearly see that each encoding varies as we go to a different position. Values for any position $pos=p$ will remain same irrespective of number of words in the sentence.
{{<figure src="https://imgur.com/YPrSqEY.png">}}

$$fig\ 5.1$$

We can further visualize the same positional encoding for say 100 words as a heatmap to see overall variation in the values of these vectors.
{{<figure src="https://imgur.com/QUP06sG.png">}}

$$fig\ 5.2$$

One can observe similar patterns in both $fig\ 5.1$ and $fig\ 5.2$:

1. There is higher variation in the range of `[-1, 1]` seen in the initial dimensions of a positional vector
2. Whereas as we go towards later dimensions of positional vector this oscillation ranges between `[0, 1]`

# Usage

Let's revisit older diagram we began with. In the above steps we saw how each position $pos$ can be represented in a unique manner. Now we have the "orange" vector which has positional information in it.

{{< figure src="/pos-enc/003-pos-and-i-desc.png" height="250">}}
{{< figure src="/pos-enc/002-pos-enc-add.png" height="250">}}

We add each word embedding at $pos=n$ with corresponding position encoding.

$$\vec{w_{n}} = \vec{e_{n}} + \vec{p_{n}}$$

Each vector $\vec{w_{n}}$ , where $n\ \epsilon\  [0,1, ... N]$ is given as an input to transformer.

| symbol        | meaning                                                 |
| ------------- | ------------------------------------------------------- |
| $N$           | total number of words                                   |
| $\vec{w_{n}}$ | word embedding with positional information at $pos = n$ |
| $\vec{e_{n}}$ | word embedding of word at at $pos = n$                  |
| $\vec{p_{n}}$ | position encoding for word at at $pos = n$              |

# Summary

This blog provides a visual mathematical guide to how a small component "position encoding" in transformer architecture works. I hope this gave you a fresh and an in depth perspective on the topic.

# Reference

- [Transformer position encoding](https://kazemnejad.com/blog/transformer_architecture_positional_encoding/)
- [Visual Guide to Transformer Neural Networks Ep 1](https://www.youtube.com/watch?v=dichIcUZfOw)
- [Why sum and not concatenate positional embedding](https://datascience.stackexchange.com/questions/55901/in-a-transformer-model-why-does-one-sum-positional-encoding-to-the-embedding-ra)
- [Why are positional encodings added (not appended)?](https://github.com/tensorflow/tensor2tensor/issues/1591)
- [Why is 10000 chosen as denominator](https://datascience.stackexchange.com/questions/82451/why-is-10000-used-as-the-denominator-in-positional-encodings-in-the-transformer#:~:text=Therefore%2C%20the%20purpose%20of%20the,would%20probably%20have%20%3C1k%20words.)
- [Pytorch source code](https://github.com/pytorch/pytorch/blob/42a192db0f064ff122fd7b9f6418f6f48ecd03ea/benchmarks/distributed/pipeline/pipe.py#L46)
- [Diagrams by Excalidraw](https://excalidraw.com/)
