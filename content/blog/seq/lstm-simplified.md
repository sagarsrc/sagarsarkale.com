---
title: "LSTM simplified"
date: "2023-09-21"
summary: "In depth and intuitive explanation of LSTM architecture"
description: "In depth and intuitive explanation of LSTM architecture"
toc: true
readTime: true
autonumber: true
math: true
tags: ["NLP", "DeepLearning", "Foundations"]
showTags: true
hideBackToTop: false
---

{{<figure src="/lstm/00-cover.png">}}

# Introduction

In my previous blog about RNNs - ["RNNs a walkthrough"](https://sagarsarkale.com/blog/seq/rnns-a-walkthrough/), we saw how recurrent neural networks worked, their limitations, like vanishing gradients, which leads to failure of learning long sequences. LSTMs try to solve for these limitations. In this blog we will go through detailed walkthrough of underlying structure of an LSTM cell.

This is my effort to simplify each of the blocks of LSTM piece by piece. In the end we join all these pieces to answer the question - How is LSTM an add on over RNNs?

# The Gate

{{< figure src="/lstm/01-the-gate.png" >}}

Believe me or not, the image above is the key to understanding the fundamental blocks of LSTM. This guard is protecting the gate above. For now let us assume that you will not be allowed through the gate without a small cost. Consider the same scenario with vectors. A vector cannot pass through certain path without a small cost. In the diagram below you can see that each value is reduced by some factor when it passes through the gate.

{{< figure src="/lstm/02-the-gate.png">}}

How do we mathematically achieve this? Simple, using a sigmoid layer. Range of Sigmoid function is between 0 and 1. (For now let us not worry about what is the input to this sigmoid layer)

{{< figure src="/lstm/03-the-gate-sigmoid-intro.png">}}

Notice how each element in the input vector $v$ is being multiplied with corresponding element in vector $t$ which is output of sigmoid layer to give resultant vector $v{'}$. This operation is called **point wise operation**. In this case we are performing point wise multiplication operation. This operation depicted above allows partial passage to the input vector.

What if we do not want input vector to pass through this special gate?

- Vector $t$ should be `[0,0,0,0,0]`

What if we want input vector to pass without any change?

- Vector $t$ should be `[1,1,1,1,1]`

# How do we concisely represent this “Gate”?

{{< figure src="/lstm/04-point-wise-and-sigmoid.png" height="500">}}

1. vectors $v$ and $t$ have $d$ dimensions
2. ⓧ here is the gate
3. $t$ has elements in the range of 0 and 1 after sigmoid activation
4. upon point wise multiplication a “fee” is collected to get new resultant vector $v'$

This procedure is critical to understand the gravity of the underlying structure of LSTMs, as this mechanism forms the basis of each fundamental block that we are going to discuss.

# Some notations before we begin

{{< figure src="/lstm/05-notations.png">}}

# Lego pieces

An LSTM unit consists of 4 blocks, 3 blocks adjacent to each other and 1 block that connects them all each block has its own significance. In order to get an functional understanding let’s first look at each lego block individually, then we can club these pieces to form a complete LSTM unit.

{{< figure src="/lstm/06-separate-lego-lstm.png" caption="Separate Lego blocks of an LSTM" width="50%" height="50%">}}

{{< figure src="/lstm/07-joined-lego-lstm.png" caption="Joined Lego blocks of an LSTM" width="50%" height="50%">}}

# A Glimpse of an LSTM cell

{{< figure src="/lstm/08-glimpse-lstm.png">}}

While LSTM cell is similar to vanilla RNN cell, one of the key distinction is that each state has 2 inputs from the previous time step, “cell state” $c_{t-1}$ and “hidden state” $h_{t-1}$. All other concepts like unrolling a recurrent neural network, back propagation through time remain the same.

Unrolling LSTM cell for 3 timesteps - recursively consume outputs of previous state and current input to generate new state for current time step.

{{< figure src="/lstm/09-unrolling-lstm.png">}}

NOTE : it is the same LSTM cell that is being viewed at 3 time steps

# A Math problem

I will be using a simple analogy to explain LSTMs. Consider you are in school and are being taught simple math.

**Situation 1** - In classroom while **learning** you solve the problem:

- e.g - 10 apples cost 200Rs, what is the cost of 2 apples?
- Let us call this **APPLE** question

**Situation 2** - In a **test** you are given a problem:

- e.g - 10 bananas cost 100Rs, what is the cost of 3 bananas?
- Let us call this **BANANAS** question

Steps to solve:

1. cost of one object is $c$
2. cost of $n$ objects is $n\times c$
3. solve for $c$ using given information
4. find cost of $t$ objects using $t\times c$

> 💡 In order to solve a problem all that matters, is that you are able to recall the concept and use previously learnt steps to solve equivalent problem in future.

Though a trivial problem, it is important to list these steps down while trying to impose these steps on internal blocks of LSTMs.

# Opening the Gates

## Gate #1 - Forget Gate

{{< figure src="/lstm/10-forgetgate.png" height="200">}}

What would your initial steps be while solving the **BANANAS** problem in exam?

1. You retain the
   1. information you got from the new question
   2. for instance data mentioned in the bananas question
2. You recall that
   1. you were taught to find cost of one apple
   2. you need to multiply cost of one apple with N apples in the question
3. You forget the
   1. problem is about apples or bananas (It is actually about finding the cost of an object)
   2. answer to question you did in class (as it is not relevant for bananas problem)

Now let us impose this analogy on LSTMs.

{{< figure src="/lstm/11-forgetgate.png">}}

|                   |                                                      |
| ----------------- | ---------------------------------------------------- |
| $F_{t}$           | output of Forget gate                                |
| $W_{f}$           | weights associated with Forget gate                  |
| $b_f$             | bias associated with Forget gate                     |
| $f_t$             | sigmoid activated vector associated with forget gate |
| $[h_{t-1},\ x_t]$ | concat vectors $h_{t-1}$ , $x_t$                     |
| $h_{t-1}$         | previous hidden state                                |
| $c_{t-1}$         | previous cell state                                  |
| $x_t$             | current input                                        |

1. retain
   - input $x_t$ and previous time step output $h_{t-1}$
   - _like data mentioned in the bananas question_
2. recall
   - using cell state $c_{t-1}$ represents previous information that you learnt
   - _like steps to solve the problem_
3. forget
   - some specifics partially which are not necessary, using the forget gate
   - _like is it apple or banana problem_

It partially forgets previous and current information, here concatenated vector $[h_{t-1}, x_t]$. Hence the name “Forget Gate”.

Now try to recall what we learnt in the earlier section about gates, it will cost you a certain fee to pass through. Same concept will be used here in order to “forget” information partially.

> 💡 But who decides what degree of information should be forgotten?

This is where weights and learning comes into play. Lets take a closer look at forget gate. Mathematically forget gate can be represented as:

- filter for “Forget Gate” - sigmoid activation

$$
f_t = \sigma{(W_f\ .\ [h_{t-1}, x_t]+b_f)}
$$

- output of “Forget Gate” - point wise multiplication

$$
F_t = c_{t-1}\ \otimes\ f_t
$$

Notice how decision on degree of information that is to be forgotten is a function of 2 vectors $h_{t-1}$ and $x_t$. We are forgetting previously learnt information partially on the basis of previous time step output as well as input of the current time step.

Now that we have passed through Gate #1 let us close it behind us and move to the next one.

## Gate #2 - Input Gate

{{< figure src="/lstm/12-inputgate.png" height="200">}}

Again let us ask the same question now that you remember how to solve the problem, also you understand that it is a problem that involves calculating cost of single unit, what would your next step be?

1. You recall that
   1. you need to setup a new equation based on new data
   2. this equation can be built using previous knowledge
2. You set up
   1. a new equation to plug in values
3. You forget the
   1. older equation (partially)
   2. values inserted in the older equation to solve apples question (completely)

Now let us try to see what LSTM does in this second stage.

{{< figure src="/lstm/13-inputgate.png">}}
| | |
| ----------------- | ----------------------------------------------- |
| $F_{t}$ | output of Forget gate |
| $I_t$ | output of Input gate |
| $W_{i}$ | weights associated with Input gate |
| $W_c$ | weights associated with Input gate |
| $i_t$ | sigmoid activated vector associated with input gate |
| $\tilde{c_t}$ | tanh activated vector associated with input gate |

1. recall and retain
   1. input $x_t$ and previous time step output $h_{t-1}$
   2. _like recalling previous equation to solve apples problem and retaining bananas problem_
2. set up
   1. here $tanh$ activated vector $\tilde{c_t}$ can be a good representation of this step
   2. _like coming up with equation for solving the bananas problem_
3. filter
   1. here point wise multiplication of $i_t$ and $\tilde{c_t}$ represents filtering
   2. _like altering values inserted in the older equation to solve apples question_

Very similar to “Forget Gate”, here LSTM tries to determine what degree of new information should be passed on to the next gate. This stage determines **how** to update old cell state of LSTM and by **what** amount. Weights which control Input gates are $W_i$ which help with filtering of input and $W_c$ which is associated with generating intermediate cell state $\tilde{c_t}$ of LSTM.

Mathematically it can be represented as

- create a filter for “Input gate”

$$
i_t = \sigma{(W_i \ .\ [h_{t-1}, x_t] + b_i)}
$$

- tanh activation for intermediate cell state generation of current time step

$$
\tilde{c_t} = tanh(W_c \ .\ [h_{t-1}, x_t] + b_i)
$$

- Output of “Input gate”

$$
I_t = \tilde{c_t} \otimes  i_t
$$

Using the output of “Forget gate” $F_t$ and “Input gate” $I_t$ , a new state or a vector is formed called **cell state**. It essentially holds new information with some learnings from the past. Very much like us humans. We add new learnings on top of our knowledge bank while we retain our learnings from the past.

This cell state can be mathematically represented as

$$
c_t = F_t \oplus I_t
$$

Notice how we are _adding_ to previous knowledge $F_t$ using point wise operation here. This cell state is further used by “Output Gate” as well as the next timestep.

## Gate #3 - Output Gate

{{< figure src="/lstm/14-outputgate.png" height="200">}}

Now we have the equation set up for us all we need to do is plug in the value and get the answer for our bananas problem.

1. You retain
   1. values of bananas problem
2. You solve
   1. for new answer according to bananas problem
   2. (using previously learnt concept like multiplication)
3. You filter
   1. imagine you are required to just fill in the final answer into the test
   2. steps are not relevant here, so you filter that and report just the final answer

Let us look how LSTMs generate final output.

{{< figure src="/lstm/15-outputgate.png">}}
| | |
| - | - |
| $W_{o}$ | weights associated with Output gate |
| $o_t$ | sigmoid activated vector associated with Output gate |
| $c_t$ | cell state associated with current time step |
| $c_t'$ | tanh activated vector associated with Output gate |
| $h_t$ | hidden state output associated with current time step |

1. recall and retain
   1. input $x_t$ and previous time step output $h_{t-1}$ → this step remains same
   2. _like recalling previous method to get final answer and retaining bananas problem_
2. solve
   1. here $tanh$ activation of cell state is a good representation of process of getting the answer
   2. _like solving for cost of n objects_
3. filter
   1. creating a filter similar to earlier gates here termed as $o_t$
   2. filtering $c_t'$ using $o_t$ to get $h_t$ which is the final output of current state
   3. _like reporting just the final answer_

The goal of this gate is to generate hidden state output $h_t$ associated with current time step. Filtering using sigmoid activation remains the same as seen in earlier gates, only the weights and biases associated with this gate change.

Mathematically this stage can be represented as:

- create a filter for “Output gate”

$$
o_t = \sigma{(W_o \ .\ [h_{t-1}, x_t] + b_o)}
$$

- tanh activation associated with “Output gate”

$$
c_t' = tanh(c_t)
$$

- output of “Output gate”

$$
h_t = o_t \otimes c_t'
$$

Notice how

1. final output $h_t$ is function of transformed current cell state $c_t'$
2. in earlier gates we saw that how $c_t'$ is function of previous cell state $c_{t-1}$ and current cell state $c_t$
3. This happens in a recursive fashion just like vanilla RNNs

All these transformations are good but what exactly makes LSTM so special? For this we will need to ask ourselves how did LSTMs solve for issues which vanilla RNNs faced.

# The missing link

{{< figure src="/lstm/16-missing-link.png">}}

In this section we will try to answer how does LSTM solve for “long term dependencies”. The easiest way to explain the piece that binds it all would be using how gates can be utilised in order to retain long term information.

For now we are concerned with two gates forget gate and input gate. **Clearing rest of the paths in LSTM for ease of explaining.**

{{< figure src="/lstm/17-missing-link.png">}}

Equations of LSTM at various timesteps

`timestep = t`

- Output of _forget gate_

$$
F_{t} = f_{t}\otimes  c_{t-1}
$$

- Output of _input gate_

$$
c_{t} = F_{t} \oplus  I_{t}
$$

$$
I_t = i_{t} \otimes \tilde{c_{t}}
$$

These equations can be combined to get

$$
c_{t} = [f_{t}\otimes  c_{t-1}] \oplus  [i_{t} \otimes \tilde{c_{t}}]
$$

> Let us see the same set of equations at various timesteps

`timestep = t+1`

$$
\begin{align}
c_{t+1} = [f_{t+1}\otimes  c_{t}] \oplus  [i_{t+1} \otimes \tilde{c_{t+1}}]
\end{align}
$$

`timestep = t`

$$
\begin{align}
c_{t} = [f_{t}\otimes  c_{t-1}] \oplus  [i_{t} \otimes \tilde{c_{t}}]
\end{align}
$$

`timestep = t-1`

$$
\begin{align}
c_{t-1} = [f_{t-1}\otimes  c_{t-2}] \oplus  [i_{t-1} \otimes \tilde{c_{t-1}}]
\end{align}
$$

Notice how cell state $c_t$ at timestep $t$ is always a function of **_addition_** of two gated **_products_**, here _forget gate_ $f_t$ and _input gate_ $i_t$.

Recall here

- how do we allow entire vector unchanged through the gate?
  - vector of 1s - `[1,1,1,1,1]`
- how do we stop entire vector to pass through the gate?
  - vector of 0s - `[0,0,0,0,0]`

Similar concept is applied here

How can we stop vectors at forget gate?

- when $f_t = [0,0,0,0,0]$
- what happens to output of _forget gate_?

$F_{t} = f_{t}\otimes  c_{t-1}\newline$
$F_{t} = [0,0,0,0,0]\otimes  c_{t-1}\newline$
$\therefore F_t = [0,0,0,0,0]$

How can we stop vectors at input gate?

- when $i_t = [0,0,0,0,0]$
- what happens to output of _input gate_?

$I_t = i_t  \otimes \tilde{c_{t-1}}\newline$
$I_t = [0,0,0,0,0]  \otimes \tilde{c_{t-1}}\newline$
$\therefore I_t = [0,0,0,0,0]$

Consider this simplified diagram where 3 time steps of LSTM are shown - let us view how information flows with respect to time step $t+1$. The stickman figure at time step $t+1$ needs some information from previous time along the **blue** path shown below, let us see if LSTM is able to provide the same.

{{< figure src="/lstm/18-missing-link.png">}}

For ease of explanation

- $f_t = c$ means $f_t = [c,c,c,c,c]$
- similarly for $I_t = c$

where $c = 0$ or $1$

## Case #1

- $f_t = 1, i_t = 0$

{{< figure src="/lstm/19-case1.png">}}

{{< figure src="/lstm/20-stickman.png" height="100">}}

> 💬 i ONLY need $c_{t-1}$ NOT $c_t$

**This case is what enables LSTM to carry over long term memory.**

Some math in action:

$c_{t} = F_{t} \oplus  I_{t}$

$c_{t} = [1 \otimes  c_{t-1}] \oplus  0  ; where  f_t=1  i_t=0$

$c_{t} =c_{t-1}$

As we can see this type of gate setting in LSTM serves as a skip connection for cell state, skipping one or more states in between to reach to required time step.

Imagine we need cell state from time step $(t-w)$, all the intermediate gates between time step $(t-w)$ and $(t+1)$ will be set to $f_{q}=1,  i_{q}=0$ where $q$ is index of intermediate time step.

Following diagram illustrates the same with

{{< figure src="/lstm/21-case1.png">}}

## Case #2

- $f_t = 0, i_t = 1$

{{< figure src="/lstm/22-case2.png">}}

{{< figure src="/lstm/20-stickman.png" height="100">}}

> 💬 i do NOT need cell states before time step $t$

Again some math:

$c_{t} = F_{t} \oplus  I_{t}$

$c_{t} = [f_t\otimes  c_{t-1}] \oplus  [i_t \otimes \tilde{c_{t}}]
  ; where  f_t=0,i_t=1$

$c_{t} = [0\otimes  c_{t-1}] \oplus  [1 \otimes \tilde{c_{t}}]$

$c_{t} =  [1 \otimes \tilde{c_{t}}]$

Here we can see that no vector passes through the _forget gate_ and we use ONLY the output of _input gate_ to generate cell state at time $t$ to be consumed at time step $t+1$.

## Case #3

- $f_t = 0, i_t = 0$

{{< figure src="/lstm/23-case3.png">}}

{{< figure src="/lstm/20-stickman.png" height="100">}}

> 💬 i need a break

This is where LSTM

- erases all previous information
- and does NOT learn anything new

Mathematically

$c_{t} = F_{t} \oplus  I_{t}$

$c_{t} = [f_t\otimes  c_{t-1}] \oplus  [i_t \otimes \tilde{c_{t}}]
  ; where  f_t=0,i_t=0$

$c_{t} = [0\otimes  c_{t-1}] \oplus  [0 \otimes \tilde{c_{t}}]$

$c_{t} =  0$

Here we can see that we allow both the vectors $c_{t-1}, \tilde{c_t}$ to pass through the _forget gate_ and _input gate_ respectively. Here we get information of both current state and states before it as some additive form of vectors mentioned above.

## Case #4

- $f_t = 1, i_t = 1$

{{< figure src="/lstm/24-case4.png">}}

{{< figure src="/lstm/20-stickman.png" height="100">}}

> 💬 i need gist of all the cell states in previous time steps
>
> (can’t catch a break now can i?)

Mathematically

$c_{t} = F_{t} \oplus  I_{t}$

$c_{t} = [f_t\otimes  c_{t-1}] \oplus  [i_t \otimes \tilde{c_{t}}]
  ; where  f_t=1,i_t=1$

$c_{t} = [1\otimes  c_{t-1}] \oplus  [1 \otimes \tilde{c_{t}}]$

$c_{t} =  [c_{t-1} \oplus \tilde{c_{t}}]$

Here we can see that we allow both the vectors $c_{t-1}, \tilde{c_t}$ to pass through the _forget gate_ and _input gate_ respectively. Here we get information of both current state and states before it as some additive form of vectors mentioned above.

# End note

This brings us to the end of this long blog. We covered how LSTMs use gated flow of vectors to retain both long and short term information, but there is still some ground left to cover, like how LSTM actually solve for vanishing gradient problem. This part is covered in detail in the references mentioned below. I hope reading this gave an in depth as well as intuitive understanding of LSTMs.

One final “diagrammatic” takeaway before ending this blog

> This is how LSTMs keep a track of both _long_ and _short_ term memory

{{< figure src="/lstm/25-end-note.png">}}

# References

1. This blog [Understanding LSTM Networks](http://colah.github.io/posts/2015-08-Understanding-LSTMs/) by **Christopher Olah** is gold standard and helped me understand internal working of LSTMs. Huge shoutout. My blog is mere interpretation of the concepts explained here.
2. [CS Toronto slides](https://www.cs.toronto.edu/~rgrosse/courses/csc321_2018/slides/lec16.pdf)
3. Detailed walkthrough LSTMs (Video series)
   1. [Back propagation and LSTM equations](https://www.youtube.com/watch?v=8rQPJnyGLlY)
   2. [How LSTMs solve vanishing gradients](https://www.youtube.com/watch?v=_Hg9Nf97Guc)
4. [How LSTM networks solve the problem of vanishing gradients](https://medium.datadriveninvestor.com/how-do-lstm-networks-solve-the-problem-of-vanishing-gradients-a6784971a577)
5. [Back propagation using dependency graph](https://prvnk10.medium.com/how-lstms-solve-the-problem-of-vanishing-gradients-ea88f08c78ca)
6. [How the LSTM improves the RNN](https://towardsdatascience.com/how-the-lstm-improves-the-rnn-1ef156b75121)

---

Written By

> [Sagar Sarkale](https://www.linkedin.com/in/sagar-sarkale)
