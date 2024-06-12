---
title: "Hello super fast blogging!"
date: "2024-04-07"
summary: "Exploring static site builder for quick blogging"
description: "Exploring static site builder for quick blogging"
toc: true
readTime: true
autonumber: false
math: false
tags: ["Web", "HUGO"]
showTags: true
hideBackToTop: false
---

# Brief

Today i tried to setup static site builder called HUGO, for blogging. It comes in handy once you set up all the parameters. It is a combination of markdown + config files. With few hours of efforts was able to set it up.

Installing HUGO is very straightforward, you can find instructions for your platform [here](https://gohugo.io/installation/).

Main problems that one could face are:

- version of HUGO and the reference blogs might be outdated, hence please refer to the latest docs of HUGO
- it is worth spending sometime to go through the [directory structure](https://gohugo.io/getting-started/directory-structure/)
- images and paths can get pretty cumbersome, i could not setup markdown based rendering in hugo for images
- using [shortcodes](https://gohugo.io/content-management/shortcodes/) for rendering images in between the content came in handy

HUGO needs some additional setup to get started with Math symbols in blogs using Katex, have attached relevant link in the references for the same.

Below are some commands to get started with HUGO.

# Commands

```bash
# install HUGO (macOS)
brew install hugo

# create HUGO site called "blog"
# choose format yaml
hugo new site blog --format yaml

# add desired theme as submodule
git submodule add https://github.com/reorx/hugo-PaperModX.git themes/PaperModX

# update submodule
git submodule update --init --recursive

# go to respective site directory
cd blog

# generate static website
hugo

# live rebuild server
hugo server -D

# using python http server
python3 -m http.server -d public

# before deploy
hugo --minify

# pagefind build index
npx pagefind --site public

# copy public folder to your hosting platform
```

# References

1. [PaperModX features](https://reorx.github.io/hugo-PaperModX/docs/features/#intro)
1. [Adding images in HUGO is pain](https://gohugo.io/content-management/shortcodes/)
1. [Math in HUGO](https://misha.brukman.net/blog/2022/04/writing-math-with-hugo/)
1. [Emoji support](https://gohugo.io/quick-reference/emojis/)
1. [Using Local fonts HUGO](https://www.chrislockard.net/posts/using-local-fonts-hugo-academic-theme/)
1. [Shortcodes super useful](https://gohugo.io/content-management/shortcodes/)
1. [Setting up internal search using pagefind](https://youtu.be/WgoBoX4qTk8?si=4dzhdOu7zq-f4Sv9)

---

Written By

> [Sagar Sarkale](https://linkedin.com/in/sagar-sarkale)
