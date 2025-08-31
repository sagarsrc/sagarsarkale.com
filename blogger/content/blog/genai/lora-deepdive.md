---
title: "LoRA: Low Rank Adaptation"
date: "2025-08-31"
summary: "Secret sauce to train large language models"
description: "Secret sauce to train large language models"
toc: true
readTime: true
autonumber: true
math: true
tags: ["GenAI", "LLM", "Training"]
showTags: true
hideBackToTop: false
---
{{<figure src="/lora/000-lora-cover.jpg">}}

# Introduction
LoRA or Low Rank Adaptation is one of the techniques which was introduced to train large language model efficiently. To quote it in numbers, using this technique while training GPT3 175B number of trainable parameters can be reduced by 10000x, all while keeping the performance at par or better than fully finetuned model. In this blog i try to condense multiple resources and the nuances that come with this technique.

# Refresher on Rank of a Matrix
Some basics first before diving into the concept. Number of linearly independent rows or columns in a matrix is known as rank of the matrix. I like to think of this in a 3D system, where each row is a vector.

## Visual guide to rank(M)

**Example 1**:

What is the simplest 3D system that would be linearly independent? Identity matrix $I_{3}$

$$I_3 = \begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \end{bmatrix}$$

Though this matrix is made of 9 numbers it's information lies across 3 dimensions. In the following representation we can clearly see each vector is linearly independent of each other.
{{<figure src="/lora/000-identity-matrix-repr.jpg">}}
- Rank of this matrix is 3
- No row can be expressed as a linear combination of the other rows

**Example 2**:


Similarly a linearly dependent vectors looks like this:
$$M_{1} = \begin{bmatrix} 1 & 0 & 0 \\\\ 3 & 0 & 0 \\\\ 0 & 0 & 0 \end{bmatrix}$$
{{<figure src="/lora/001-linearly-dependent.jpg">}}
- Rank of this matrix is 1
- Row $r_2$ is 3 times Row $r_1$

**Example 3**:


Extending the same concept further we can have a matrix with rank 2:
$$M_{2} = \begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 1 \\\\ 0 & 0 & 0 \end{bmatrix}$$
{{<figure src="/lora/002-rank2-matrix.jpg">}}
- Rank of this matrix is 2
- Only the first two rows are linearly independent, the third row is zero

**Key Properties of Matrix Rank**:

| Property | Mathematical Expression | Description |
|----------|------------------------|-------------|
| **Upper bound** | $\text{rank}(A) \leq \min(m, n)$ | Rank cannot exceed smallest dimension |
| **Full vs Low rank** | Full: $\text{rank}(A) = \min(m, n)$ | When rank equals smallest dimension |
| **Multiplication** | $\text{rank}(AB) \leq \min(\text{rank}(A), \text{rank}(B))$ | Product rank is bounded by minimum |
| **Addition** | $\text{rank}(A + B) \leq \text{rank}(A) + \text{rank}(B)$ | Sum rank is bounded by sum of ranks |
| **Subtraction** | $\text{rank}(A - B) \leq \text{rank}(A) + \text{rank}(B)$ | Difference rank follows same bound as addition |
| **Transpose** | $\text{rank}(A^T) = \text{rank}(A)$ | Rank is preserved under transpose |
| **Zero rank** | $\text{rank}(A) = 0 \iff A = 0$ | Only zero matrix has rank zero |


# What is Low Rank Adapter?


## Brief
LoRA adds a low-rank update to frozen pre-trained weights. Instead of updating the original weight matrix $W_0$ directly, LoRA keeps it frozen and learns a low-rank decomposition $\Delta W = BA$ to adapt the model:

$$
W = W_0 + \Delta W = W_0 + BA
$$

Where:
$$
B \in \mathbb{R}^{d \times r}, \quad A \in \mathbb{R}^{r \times d}, \quad W_0 \in \mathbb{R}^{d \times d}
$$

With $r \ll d$ (r much smaller than d), making the adaptation parameter-efficient.

> Essentially we are trying to learn what is $\Delta W$ that should be added to existing weights of a model to learn / adapt to a new task.

Visually it looks like this:
{{<figure src="/lora/003-lora-diagram.jpg">}}

**Where does rank fit in?**
- Notice $r$ i.e rank in above diagram
- You choose it as a parameter, generally $r \ll d$

**But how does it imply parameter efficient training?**
- Without LoRA, learnable weights were $d^2$
- With LoRA, we only need to learn $ 2dr = d \times r + r \times d$ weights, such that $r \ll d$
- This reduces number of trainable parameters drastically

**Is Rank calculated during this process?**
- NO! rank of matrix is not calculated during LoRA training or inference
- When you choose hyperparameter $r$, you are essentially saying that your matrix $B$ or $A$ will have lower rank than the original matrix $W_0$
- Upon multiplication matrices $B$ and $A$ resultant rank will be $min(rank(A), rank(B))$ which will be smaller than $rank(W_0)$
- **Key takeaway**: You have a rank constraint, you do NOT compute it.

**What does rank $r$ determine?**
- How much compression you get
- How much expressivity you retain
- How much computation you save

## Training: LoRA

## Inference: LoRA


# What does LoRA unlock?
Tell about how lora adapters can be quickly loaded and unloaded, give example of diffusion models which can generate avatars and realistic figures.

# LoRA and a small neural network

# LoRA and trainable params


# References
1. [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
1. [What is Low-Rank Adaptation (LoRA) | explained by the inventor](https://youtu.be/DhRoTONcyZE?si=OZR7DpcHrqpP_UC_)