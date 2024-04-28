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

{{< figure src="/pos-enc/000-words-to-emb-pos.png" height="250">}}

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

# Breaking down Math

## step 1

As we can see here there are two operations being performed on even index of embedding dimension. All even indices are some function of sine and odd indices are some function of cosine.

$$ PE\_{(pos,2i)} = sin(\theta)$$

$$ PE\_{(pos,2i+1)} = cos(\theta)$$

Where $\theta$ is a function of $pos$ and $i$

$$ \theta = {pos}/{{10000}^{{2i}/{d}}} $$
$$ \theta = {pos} \* {1}/{{10000}^{{2i}/{d}}}$$

- $pos$ is just a multiplying factor
- whereas division term ${1}/{{10000}^{{2i}/{d}}}$
- it a decaying function which ranges between $(0,1]$

## step 2

Let us try to plot this division term.
$${1}/{{10000}^{{2i}/{d}}}$$

{{<figure src="https://imgur.com/sygcNso.png">}}

## step 3

On multiplying $pos$ term with division term.
$$ \theta = {pos} \* {1}/{{10000}^{{2i}/{d}}}$$

{{<figure src="https://imgur.com/w0IsYR7.png">}}

Notice how each word's position starts from a different point on y axis.

## step 4

Now for each even index applying sine function, and for each odd index applying cosine function.

$$ PE\_{(pos,2i)} = sin(\theta)$$

$$ PE\_{(pos,2i+1)} = cos(\theta)$$
{{<figure src="https://imgur.com/dAFuCbw.png">}}

# Other possibilities

Let's say we use only 1s and 0s to represent a position as a vector.
Converting position indices to binary format is the easy part, but how do we merge this position vector with input embedding?

<!-- {{< figure src="/pos-enc/001-bin-pos-enc.svg" height="400">}} -->

There are 2 ways of merging the position vectors with embedding vectors.

## Concatenating vectors

<!-- {{< figure src="/pos-enc/002-concat-vec.svg" >}} -->

## Adding vectors

<!-- {{< figure src="/pos-enc/002-add-vec.svg" >}} -->

## Appending vectors

| Decimal | Binary                   |
| ------- | ------------------------ |
| 1       | [0, 0, 0, 0, 0, 0, 0, 1] |
| 2       | [0, 0, 0, 0, 0, 0, 1, 0] |
| ..      | ..                       |
| 8       | [0, 0, 0, 0, 1, 0, 0, 0] |
| 9       | [0, 0, 0, 0, 1, 0, 0, 1] |
| 10      | [0, 0, 0, 0, 1, 0, 1, 0] |

## Adding vectors

| Decimal | Binary                   | Padded binary                                    |
| ------- | ------------------------ | ------------------------------------------------ |
| 1       | [0, 0, 0, 0, 0, 0, 0, 1] | [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] |
| 2       | [0, 0, 0, 0, 0, 0, 1, 0] | [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0] |
| ..      | ..                       | ..                                               |
| 8       | [0, 0, 0, 0, 1, 0, 0, 0] | [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] |
| 9       | [0, 0, 0, 0, 1, 0, 0, 1] | [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1] |
| 10      | [0, 0, 0, 0, 1, 0, 1, 0] | [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0] |

# Why NOT concat?

#

# Reference

- [Visual Guide to Transformer Neural Networks - (Episode 1) Position Embeddings](https://www.youtube.com/watch?v=dichIcUZfOw)
- [Why sum and not concatenate positional embedding](https://datascience.stackexchange.com/questions/55901/in-a-transformer-model-why-does-one-sum-positional-encoding-to-the-embedding-ra)
- [Why are positional encodings added (not appended)?](https://github.com/tensorflow/tensor2tensor/issues/1591)
- [Why is 10000 chosen as denominator](https://datascience.stackexchange.com/questions/82451/why-is-10000-used-as-the-denominator-in-positional-encodings-in-the-transformer#:~:text=Therefore%2C%20the%20purpose%20of%20the,would%20probably%20have%20%3C1k%20words.)
- [Pytorch source code](https://github.com/pytorch/pytorch/blob/42a192db0f064ff122fd7b9f6418f6f48ecd03ea/benchmarks/distributed/pipeline/pipe.py#L46)

- [Diagrams by Excalidraw](https://excalidraw.com/)
