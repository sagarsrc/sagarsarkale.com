---
title: "Inputs to Byte Latent Transformer"
date: 2025-12-12
summary: "Part 2 of All you need to know to get started with Byte Latent Transformer"
description: "Part 2 of All you need to know to get started with Byte Latent Transformer"
toc: true
readTime: true
autonumber: false
math: true
tags: ["GenAI", "BLT", "Transformers", "DeepDive"]
showTags: true
mermaid: true
hideBackToTop: false
---

{{<figure src="/blt2/000-cover.png">}}

# Introduction

In the [Part 1 of this series on BLT](https://sagarsarkale.com/blog/genai/precursors-to-byte-latent-transformer/), we discussed about some prerequisites to understand Byte Latent Transformer. To briefly summarize, BLT is a tokenizer-free architecture that matches tokenizer-based LLM performance at scale. We also saw how entropy-based patching is used to convert the input text into a sequence of bytes.

## Recall

In the last post we converted the input text into a sequence of bytes. Let's recall the steps:

1. The input sentence was: `"Sherlock Holmes is a smart detective."`
2. Using entropy-based patching, we broke the sentence into patches of bytes.
3. As you can see in the figure below, the sentence was broken into patches using 4 variants of entropy-based patching.

{{< figure src="/blt1/008-patches-2.png">}}

## Up Next!

In this post, we will discuss about how these patches are further processed in BLT. Let us have a look at the architecture of BLT and see which areas are we going to cover in this post.

{{< figure src="/blt2/001-upnext-and-where-are-we.png">}}

Self Reference:

```
1. Local Encoder
   1. Embeddings:
      1. Hash n-gram Embedding
      2. Hash Embeddings
      3. Frequency Embeddings
   2. How all of these embeddings are combined together
   3. Local Encoder Diagram
   4. How residual connection is sent out of this local encoder
2. Latent Global Transformer Model
```

# Local Encoder

Once we have the patches from the entropy-based patching, we pass them through the local encoder. In order to get to the local encoder we need to convert the patches into embeddings first. BLT uses 3 major types of embeddings in the play here:

1. Byte Embeddings
2. Hash ngram Embeddings
3. Position Embeddings

Let us see this in a rough flow diagram to understand it better.

{{<mermaid>}}
graph LR
style input fill:#f0f7ff,stroke:#666,stroke-width:2px
style patches fill:#ffe0b2,stroke:#666,stroke-width:2px
style byte fill:#fge0b2,stroke:#666,stroke-width:2px
style hash fill:#ebbee7,stroke:#666,stroke-width:2px
style freq fill:#ffcdd2,stroke:#666,stroke-width:2px
style combine fill:#b3e5fc,stroke:#666,stroke-width:2px
style combined fill:#c8e6c9,stroke:#666,stroke-width:2px

    input --[E]--> patches
    patches --> byte[Byte Embeddings]
    patches --> hash[Hash n-gram Embedding]
    patches --> freq[Position Embedding]
    byte --> combine[combine]
    hash --> combine
    freq --> combine
    combine --> combined[Combined Embeddings]

{{</mermaid>}}

Where [E] is the entropy-based patching step.

Let us look deeper into each of these embeddings.

## Byte Embeddings

This embedding is the simplest one. It is just a representation of all possible individual byte values which are learnt during the training of the model.

## Hash n-gram Embeddings

Let's try to understand how what is ngram embeddings first, then we will see how and why hashing is used a bit later in this section. Instead of passing all the bytes directly to the model, we pass it in chunks, these chunks are generated exhaustively from the input text using ngrams. Let's see how this is done.

**Step 1: Basic Building Blocks**

Let's use a familiar input sentence: `"Hello World"`

First, let's see what our text looks like as bytes (similar to how a computer sees it):

```
H    e    l    l    o    _    W    o    r    l    d
72   101  108  108  111  32   87   111  114  108  100

```

**Step 2: Creating Groups (N-grams)**

Now comes the fun part - we'll look at this text in different-sized windows:

For 2-letter Groups (n=2):

```
He (72,101)
el (101,108)
ll (108,108)
lo (108,111)
o_ (111,32)
_W (32,87)
Wo (87,111)
or (111,114)
rl (114,108)
ld (108,100)

```

It's like sliding a two-character window across our text!

For 3-letter Groups (n=3):

```
Hel (72,101,108)
ell (101,108,108)
llo (108,108,111)
lo_ (108,111,32)
o_W (111,32,87)
_Wo (32,87,111)
Wor (87,111,114)
orl (111,114,108)
rld (114,108,100)

```

Now we're looking at three characters at a time!

**Step 3: ID Assignment**

Here's where it gets interesting! We give each unique group a number (like a catalog ID):

```
2-letter groups:
"He" -> 1
"el" -> 2
"ll" -> 3
"lo" -> 4
...

3-letter groups:
"Hel" -> 1
"ell" -> 2
"llo" -> 3
...

```

BLT uses ngrams of size $n$ where $n \in \\{3,4,5,6,7,8\\}$ .

**Step 4: Hashing**

Let us understand what hashing is in brief first. Hashing is like creating a fingerprint for data - **it converts data of any size into a fixed-size value**.

```python
# X mod N = remainder

# hash function
def hash_function(number, table_size):
    return number % table_size

# Example
number = 456
table_size = 10
hash_value = hash_function(number, table_size)

# Output
print(f"{number} hashes to {hash_value}")
# 456 hashes to 6
# 6 is the hash value
```

If we provide a number of say 10 or 100 or even 1000 digits to the hash function, the hash value will be a single digit. Hence, we are able to reduce the size of the data to a single digit.

But, you see the problem here is that the hash value is not unique. For example, if we have two numbers `456` and `1456`, they both hash to `6`. This is where the hashing function fails, this is called a collision. By increasing complexity of the hash function, we can reduce the number of collisions and map the data to a unique hash value.

Now that we have some understanding of hashing, let us see how it is used in BLT.

Remember we are using ngrams of size 3, 4, 5, 6, 7, 8. Each of this has a different size by default. How do we map these ngrams to a unique hash value? That's where hashing comes into the picture, it helps us create a catalog of ngrams.

{{<mermaid>}}
graph LR
%% Style definitions
classDef inputStyle fill:#dbeafe,stroke:#2563eb,stroke-width:2px
classDef hashStyle fill:#fef9c3,stroke:#ca8a04,stroke-width:2px
classDef outputStyle fill:#dcfce7,stroke:#16a34a,stroke-width:2px
classDef subgraphStyle fill:white,stroke:#94a3b8,stroke-width:1px

    subgraph NGrams["Input N-grams"]
        ngram1["'Hel'"]
        ngram2["'ell'"]
        ngram3["'llo'"]
    end

    subgraph HashFunction["Hash Function"]
        hash{"sum(ascii) % 10"}
    end

    subgraph HashTable["Hash Table"]
        val1["Slot 1: 'Hel'"]
        val2["Slot 2: 'ell'"]
        val3["Slot 3: 'llo'"]
    end

    ngram1 --> hash
    ngram2 --> hash
    ngram3 --> hash

    hash --> val1
    hash --> val2
    hash --> val3

    %% Apply styles
    class ngram1,ngram2,ngram3 inputStyle
    class hash hashStyle
    class val1,val2,val3 outputStyle
    class NGrams,HashFunction,HashTable subgraphStyle

{{</mermaid>}}

This is very analogous to having a token_id for each token in the tokenizer. Instead of using the tokenizer, we are using ngrams to create a catalog of ngrams, which is then used to create embeddings. Also because we are operating on bytes this ngram is called as bytegrams.

Instead of using `sum(ascii) % 10` as hash function, BLT uses a more sophisticated hash function to create the catalog of ngrams. The function is called as RollPolyHash (Rolling Polynomial Hash).

Taken from the paper:

> Given a byte $n$-gram $g_{i,n} = \{b_{i-n+1},\ldots,b_i\}$
>
> Here $g_{i,n}$ is the set of bytegrams for each byte position $i$ and $n$ from 3 to 8.
>
> The rolling polynomial hash of $g_{i,n}$ is defined as:

$$ \text{Hash}(g_{i,n}) = \sum_{j=1}^n b_{i-j+1}a^{j-1} \qquad\dotsb\qquad (1) $$

Where $a$ is chosen to be a 10-digit prime number.

The same can be simplified as:
$$\text{Hash}(g) = b_{1} + b_{2}a + b_{3}a^2 + \cdots + b_{n}a^{n-1}$$

But what does this hash function have to do with embeddings?

**Step 5: Embeddings and Hash function**

Let us see how embeddings come into the picture now.


{{<figure src="/blt2/002-rollpolyhash.png">}}

## Frequency Embeddings

# References

1. [Byte Latent Transformer Research Paper](https://arxiv.org/pdf/2412.09871)
2. [Byte Latent Transformer Github](https://github.com/facebookresearch/blt/tree/main)

---

Written By

> Sagar Sarkale
