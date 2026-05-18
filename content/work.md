---
title: "My Professional Journey"
toc: false
readTime: false
autonumber: false
math: false
tags: ["work"]
showTags: false
hideBackToTop: false
---
# Quickcall.dev

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/work/quickcall.png" height="50px">}}

> Founder
> (Dec 2025 - Present)

- Solving for developer productivity by solving for interruptions in their workflow
- Building QuickCall, an AI assistant that helps you connect your org tools and workflows without switching context

# Yral

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/work/yral.png" height="50px">}}

> AI Consultant
> (Jan 2025 - Nov 2025)

- Built RAG based content moderation system (86.8% accuracy, +26%) using Phi-3.5 4B
- Deployed content moderation system on T4x2 GPU (19K req/USD, 3 req/sec)
- Optimized LLM inference with KV caching: ~70% cache hit rates and ~150 tokens/sec throughput on T4 GPU
- Developed real-time recommendation system with online learning capabilities, architected to support million-scale user interactions
- Architected end-to-end candidate generation and personalization pipeline with Airflow, GCP BigQuery, Redis caching
- Self-hosted MuseTalk talking head for video generation, supporting both image-to-video and video-to-video avatar synthesis

# People+AI

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/work/peopleai.jpg" height="50px">}}

> AI Consultant
> (Nov 2024 - Dec 2024)

- Conducted systematic evaluation of 15+ existing Indic LLM benchmarks, mapping coverage gaps across 22 Indian languages
- Analyzed limitations in current evaluation frameworks: cultural context gaps, regional dialect coverage, and domain-specific assessments
- Researched ASR model evaluation approaches for Indian languages, identifying WER measurement inadequacies for multilingual contexts
- Designed comprehensive framework for India's first standardized LLM leaderboard addressing identified evaluation gaps
- Authored strategic roadmap for 10 trillion token collection across Indian languages, published as a [blog](https://peopleplus.ai/blog/ten-trillion-tokens-making-ai-work-for-every-indian-language)
- Educated NGOs on AI impact potential through STARS forum presentation, along with ideation sessions on AI for social good

# smallstep.ai

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/work/smallstep.png" height="120px">}}

> Founder
> (Dec 2023 - Present)

**Building Marathi LLM**:

- Built custom SentencePiece tokenizer for Marathi, adding 15K tokens to address 3-5x token inefficiency in Llama's English tokenizer
- Pretrained and Finetuneed Misal (Marathi LLM) 7B/1B models on 2B Marathi tokens using LoRA on A100 GPU
- Curated and cleaned 200K Marathi instruction dataset from Alpaca translations, along with IndicQuestionGeneration data
- Conducted systematic evaluation across reading comprehension, translation, sentiment analysis using internal QA dataset
- Achieved superior performance vs ChatGPT 3.5 on reading comprehension tasks, establishing first competitive Marathi LLM
- Open-sourced [models](https://huggingface.co/smallstep/Misal-7B-base-v0.1), tokenizer, pretraining configs, and evaluation framework for regional language LLMs
- Published a technical blog with entire procedure: [Making Misal](/blog/genai/making-misal) (mirror of [smallstep.ai/making-misal](https://smallstep.ai/making-misal))
- Launch : [Linkedin Post](https://www.linkedin.com/posts/sagar-sarkale_misal-activity-7184874193405038594-lgkE?utm_source=share&utm_medium=member_desktop), [Twitter Post](https://x.com/smallstepai/status/1779108646263423307)
- Coverage : [YourStory](https://yourstory.com/2024/05/for-the-love-of-misal-smallstepai-is-building-an-llm-for-marathi), [Moneycontrol](https://www.moneycontrol.com/news/technology/bootstrapped-ai-startup-smallstep-serves-up-misal-a-marathi-llm-12693311.html), [ARB Podcast](https://www.youtube.com/watch?v=YHVFgb0RTVg)
- Open Source : [Huggingface Space](https://huggingface.co/smallstepai)

# Medpiper

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/work/medpiper.png" height="50px">}}

> AI Consultant
> (Jan 2024 - Jun 2024)

**Medical Documents Digitization**:

- Led development of an AI platform for medical document digitization
- Engineered automatic annotation system for labelling and training
- Reduced processing time from 10 minutes to 1 minute, achieving a 10x performance boost

# Tekion

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/work/tekion.webp" height="120px">}}

> Data Scientist
> (Aug 2022 - Jul 2023)

**Document AI - Table Extraction**:

- Developed a robust solution for extracting rows and columns from tables in images
- Trained a mask-RCNN based model to identify the structure of table components
- Reconstruction of table components for consumption

**Automobile Service Recommendation**:

- Conducted comprehensive EDA on seasonal trends in services taken
- Discovered key associations between different services taken
- Generated recommendations for individual vehicles based on their unique service histories.
- Impact : Significant increase in service add to cart and service taken rates

# Pratilipi

{{<figure src="https://pub-9f767bb50303496e94b0f84838fbefc0.r2.dev/work/pratilipi.png" height="100px">}}

> Data Scientist
> (Dec 2020 - Aug 2022)

**Modelling user item interactions using autoencoders**:

- Leveraging bottle neck vectors as embeddings
- Creating a querying model to fetch similar interactions
- Built a collaborative filtering model
- Impact : High impact in reads and improvements in monetization observed

**Creating hooks for increasing interaction at the end of each content**:

- Leveraging Author similarity and common interactions of users
- Generating relevant author embeddings to capture category information
- Impact : 2x growth in reads after a user completed a read

**Next authors to follow model**:

- Applied clustering and probabilistic approach to compute “follow author” recommendations
- Impact : 20% increase in follow action from author profile page

> Data Science Intern
> (Dec 2020 - Feb 2021)

**Category personalisation "For you" section**:

- Captured category interests and subcategory interests of users
- Personalised various category combinations
- Impact : Multi front impact on top line, monetisation and author follows observed

**Conducted multiple experiments in "For you" section of the app**:

- Tested multiple hypothesis to increase reads
- Conducted analysis to get insights of user behaviour across multiple geographies
