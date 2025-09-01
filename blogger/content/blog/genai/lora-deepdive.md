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
mermaid: true
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


Similarly a set of linearly dependent vectors looks like this:
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

> Essentially we are trying to learn what $\Delta W$ should be added to existing weights of a model to learn / adapt to a new task.

Visually it looks like this:
{{<figure src="/lora/003-lora-diagram.jpg">}}

**Where does rank fit in?**
- Notice $r$ i.e rank in above diagram
- You choose it as a parameter, generally $r \ll d$
- Typically $r \in \\{8, 16, 32, 64\\}$, and is decided empirically

**But how does it imply parameter efficient training?**
- Without LoRA, learnable weights were $d^2$
- With LoRA, we only need to learn $ 2dr = (d \times r + r \times d)$ weights
- As $r \ll d$ it reduces number of trainable parameters drastically

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
During training:
- $W_0$ remains frozen (gradients blocked)
- Only $A$ and $B$ matrices are updated via backpropagation
- Forward pass: $h = (W_0 + BA)x$ where $x$ is input

### Visual guide to training LoRA
{{<mermaid>}}
flowchart TD
    input["Input $x$"]

    subgraph matrices[Weight Matrices]
        frozen["$W_0$ Frozen<br/>No Gradients"]
        matrixA["Matrix $A$<br/>Trainable"]
        matrixB["Matrix $B$<br/>Trainable"]
    end

    subgraph forward[Forward Pass]
        multiply["$B \times A$"]
        add["$W_0 + BA$"]
        output["Output $h$"]
    end

    subgraph backward[Backward Pass]
        gradA["$\nabla A$"]
        gradB["$\nabla B$"]
        blocked["$\nabla W_0 = 0$<br/>Blocked"]
    end

    input --> matrices
    matrixB --> multiply
    matrixA --> multiply
    frozen --> add
    multiply --> add
    add --> output

    output --> gradA
    output --> gradB
    output -.-> blocked

    style frozen fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style matrixA fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px
    style matrixB fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px
    style multiply fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
    style add fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    style output fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px
    style gradA fill:#FFCDD2,stroke:#C62828,stroke-width:2px
    style gradB fill:#FFCDD2,stroke:#C62828,stroke-width:2px
    style blocked fill:#ECEFF1,stroke:#455A64,stroke-width:2px,stroke-dasharray: 5 5
{{</mermaid>}}

> **Key insight**: The $\nabla W_0 = 0$ means gradients for $W_0$ are blocked/not calculated. $W_0$ remains completely frozen during training - only the small matrices $A$ and $B$ receive gradient updates. The dotted arrow shows this blocked gradient flow.

## Inference: LoRA
During inference:
- **Option 1**: Compute $W_0 + BA$ once and use merged weights
- **Option 2**: Keep separate and compute $W_0x + BAx$
- **Adapter swapping**: Replace $BA$ with different adapters for different tasks

### Option 1: Merged Weights
*Pre-compute the combined weights once, then use standard inference*

{{<mermaid>}}
flowchart TD
    input1["Input $x$"]

    subgraph setup["Setup Phase"]
        w0["$W_0$ Base Weights"]
        lora["$BA$ LoRA Weights"]
        merge["Merge: $W = W_0 + BA$"]
    end

    subgraph inference["Inference Phase"]
        forward["Forward: $Wx$"]
        output1["Output $h$"]
    end

    input1 --> setup
    w0 --> merge
    lora --> merge
    merge --> forward
    forward --> output1

    style w0 fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style lora fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px
    style merge fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
    style forward fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    style output1 fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px
{{</mermaid>}}

### Option 2: Separate Computation
*Compute base and LoRA paths separately, then add their outputs*

{{<mermaid>}}
flowchart TD
    input2["Input $x$"]

    subgraph paths["Parallel Paths"]
        path1["Base Path: $W_0x$"]
        path2["LoRA Path: $BAx$"]
    end

    subgraph combine["Combination"]
        sum["Sum: $W_0x + BAx$"]
        output2["Output $h$"]
    end

    input2 --> path1
    input2 --> path2
    path1 --> sum
    path2 --> sum
    sum --> output2

    style path1 fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style path2 fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px
    style sum fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
    style output2 fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px
{{</mermaid>}}

### Option 3: Adapter Swapping
*Keep multiple task-specific LoRA adapters and swap them dynamically*

{{<mermaid>}}
flowchart TD
    input3["Input $x$"]

    subgraph base["Base Model"]
        w0_base["$W_0$ Frozen Base"]
    end

    subgraph adapters["Available Adapters"]
        task1["Task 1: $B_1A_1$"]
        task2["Task 2: $B_2A_2$"]
        task3["Task 3: $B_3A_3$"]
    end

    subgraph selection["Dynamic Selection"]
        switch["Select Adapter"]
        selected["Selected: $B_iA_i$"]
    end

    subgraph compute["Computation"]
        final["$W_0 + B_iA_i$"]
        output3["Output $h$"]
    end

    input3 --> base
    adapters --> switch
    switch --> selected
    w0_base --> final
    selected --> final
    final --> output3

    style w0_base fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style task1 fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
    style task2 fill:#FFEBEE,stroke:#D32F2F,stroke-width:2px
    style task3 fill:#E1F5FE,stroke:#0277BD,stroke-width:2px
    style switch fill:#FFF9C4,stroke:#F9A825,stroke-width:2px
    style selected fill:#FFCDD2,stroke:#C62828,stroke-width:2px
    style final fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px
    style output3 fill:#E8EAF6,stroke:#3949AB,stroke-width:2px
{{</mermaid>}}

# What does LoRA unlock?

LoRA's flexible inference approaches enable several powerful capabilities:

## No Additional Latency
(Option 1: Merged Weights)
- Once weights are merged ($W_0 + BA$), inference runs at **original speed**
- No additional latency introduced during inference
- Perfect for production deployment where speed matters

## Massive Storage Savings
- Store one base model + multiple small adapters instead of full fine-tuned models
- **Example**: Instead of storing 10 different 7B models (70GB total), store 1 base model (7GB) + 10 LoRA adapters (~50MB each = 500MB)
- **Result**: 70GB → 7.5GB (90% storage reduction)

## Dynamic Task Switching
(Option 3: Adapter Swapping)
- Keep multiple LoRA adapters in memory simultaneously
- Switch between tasks instantly without reloading models
- **Diffusion model example**:
  - Same base Stable Diffusion model
  - Adapter 1: Anime character style
  - Adapter 2: Oil painting style
  - Adapter 3: Photorealistic portraits
  - Switch styles in real-time based on user preference

## Modular AI Systems
- Mix and match adapters for different capabilities
- Compose multiple LoRA adapters for complex tasks
- Enable personalized AI that adapts to user preferences on-demand

## Efficient Model Serving
- Load base model once, serve multiple specialized versions by swapping small adapters
- **Storage efficiency**: Keep many task variants without storing full models
- **Memory usage**: Same GPU memory as base model (adapters are tiny compared to full weights)


# LoRA and a small neural network

# LoRA and trainable params

# Looking at huggingface library


# References
1. [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
1. [What is Low-Rank Adaptation (LoRA) | explained by the inventor](https://youtu.be/DhRoTONcyZE?si=OZR7DpcHrqpP_UC_)