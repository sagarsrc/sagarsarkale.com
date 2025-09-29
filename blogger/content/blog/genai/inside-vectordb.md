---
title: "Inside a VectorDB"
date: "2025-09-28"
summary: "Secret sauce to train large language models"
description: "Secret sauce to train large language models"
toc: true
readTime: true
autonumber: true
math: true
tags: ["VectorDB", "DeepDive"]
showTags: true
hideBackToTop: false
mermaid: true
---
{{<figure src="/vectordb/000-cover.png">}}

# Introduction

Imagine you are an e-commerce platform with say 10 million products on your website. Your customers are searching for products by name, description, or attributes. You want the ability to find the products that are most similar to the query. How do you go about it? Fuzzy searches / Keyword searches, well it would fail miserably given the scale and nature of the problem.

When semantic search is not an option, we turn to vector similarity search! We all know description of products can be represented as a vector, but how do we store these vectors and query them efficiently at scale? This is where VectorDBs come into play.

# Traditional route

When we fire a query to a traditional database, it is a simple table lookup. But here your natural language query is encoded to an n-dimensional vector first and then looked up in the database holding more such vectors.

This is where the magic happens: **Vector Similarity Search**.

## The Brute Force Problem

The most straightforward approach to find similar vectors is the **K-Nearest Neighbors (KNN) exact search**. Here's how it works:

1. Take your query vector
2. Compare it with **every single vector** in the database
3. Calculate distance (cosine, euclidean, etc.) for each comparison
4. Sort all distances and return the K closest vectors

{{<figure src="/vectordb/001-knn.jpg" caption="KNN exact search: Query vector compared against all N vectors in database">}}

## Why This Doesn't Scale

Let's put this into perspective with some numbers:

- **Database size**: 10 million product vectors
- **Vector dimensions**: 768 (typical for text embeddings)
- **Query time**: For each search, you need 10M distance calculations
- **Memory**: All vectors must be kept in memory for fast access

> All this with additional overhead of doing cosine similarity calculation which itself is a computationally intensive operation and increases with dimensionality of the vectors.

```python
# Pseudo-code for brute force search
def knn_search(query_vector, database_vectors, k=5):
    distances = []
    for vector in database_vectors:  # O(N) - This is the problem!
        distance = calculate_distance(query_vector, vector)
        distances.append((distance, vector))

    # Sort and return top K
    return sorted(distances)[:k]  # O(N log N)
```

The time complexity is **O(N)** for each query, where N is the number of vectors. With millions of vectors and hundreds of concurrent users, this becomes computationally prohibitive.

**Real-world impact:**
- Query latency: Several seconds per search
- CPU usage: Maxed out with just a few concurrent users
- Memory requirements: Entire dataset must fit in RAM
- Cost: Expensive hardware for acceptable performance

Can we do better than this?

# The smarter route

Instead of going through all the vectors, we can utilize inherent nature of the vectors to our advantage. Can we skip some of the vectors and still get **approximate neighbors** without losing relevance? Turns out we can, if we use clever data structures to store these vectors.

Here are some approaches to get approximate nearest neighbors:
- KD Trees
- Locality Sensitive Hashing (LSH)
- Annoy
- HNSW

To keep the scope of this blog brief, we will focus on HNSW, which is widely used in practice.

## Core Philosophy of HNSW

HNSW stands for **Hierarchical Navigable Small World Graph**. It is a graph-based data structure that is used to store vectors and query for approximate nearest neighbors.

### Real World Travel Analogy

Imagine you live in a city in state $S_1$ and want to visit a remote village in state $S_k$. Instead of driving through every town, you use the hierarchical highway system:

**Level 2 - Interstate Roads (State-to-State)**

Goal: navigate from one state to another.
- **States ($S_1$, $S_2$, $S_k$)**: Represent major regions in the vector space
- **Solid arrows**: Direct interstate highways between states
- **Dashed arrows**: Long-distance connections that can be skipped
- Navigate from $S_1$ → $S_2$ ... → $S_k$ using the most efficient interstate route

{{<figure src="/vectordb/002-analogy1.jpg" caption="Level 2: State-to-State travel using Interstate highways and major hub cities">}}

**Level 1 - Regional Travel (Inter-City)**

Goal: navigate through cities.
- **Gray circles**: Regular cities/vectors within each state
- **Red circles**: Hub cities that connect to other states
- **Hatched areas**: Irrelevant regions skipped during greedy search
- **Blue circle**: Target destination in state $S_k$
- Search within the relevant regions, skip irrelevant areas

{{<figure src="/vectordb/002-analogy2.jpg" caption="Level 1: Regional travel within state using state highways">}}

**Level 0 - Local Navigation (Village-to-Village)**

Goal: navigate through villages.
- **Connected nodes**: Local road networks between nearby cities
- **Green path**: Actual search route taken from start to target
- **Blue dotted connections**: Final local connections to reach destination
- Navigate through local connections to find the exact target vector

{{<figure src="/vectordb/002-analogy3.jpg" caption="Level 0: Local navigation to find the exact destination village">}}

### Why This Works

- **Hub Cities**: Act as shortcuts connecting distant regions efficiently
- **Hierarchical Levels**: Each level provides different granularity of navigation
- **Skip Irrelevant Areas**: Never waste time in regions that don't help
- **Approximate Results**: Fast navigation to very good destinations

This is exactly how HNSW organizes vectors - using smart way of organizing vectors similarity search can be optimized for speed while still maintaining relevance.

## How HNSW works

Here we will dive deep into internals of how HNSW works.

