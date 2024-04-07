---
title: "Hello HUGO"
date: 2024-04-07T10:38:54.267Z
# weight: 1
# aliases: ["/first"]
author: "Sagar Sarkale"
showToc: true
TocOpen: true
TocSide: "left"
draft: false
hidemeta: false
comments: false
description: "Exploring static site builder for quick blogging"
canonicalURL: "https://canonical.url/to/page"
disableShare: false
hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
tags: ["Web", "HUGO"]
cover:
  image: "personal/add-hugo-image.png" # image path/url
  alt: "<alt text>" # alt text
  caption: "<text>" # display caption under cover
  relative: false # when using page bundles set this to true
  hidden: false # only hide on current single page
editPost:
  URL: "https://github.com/<path_to_repo>/content"
  Text: "Suggest Changes" # edit text
  appendFilePath: true # to append file path to Edit link
---

# commands

```bash
# create HUGO site called "blog"
# choose format yaml
hugo new site blog --format yaml

# add desired theme as submodule
git submodule add https://github.com/reorx/hugo-PaperModX.git themes/PaperModX

# update submodule
git submodule update --init --recursive

# go to respective site
cd blog

# generate static website
hugo

# live rebuild server
hugo server -D

# before deploy
hugo --minify

# copy public folder to your hosting platform
```

# references

1. [PaperModX features](https://reorx.github.io/hugo-PaperModX/docs/features/#intro)
1. [Adding images in HUGO is pain](https://gohugo.io/content-management/shortcodes/)
1. [Math with HUGO](https://misha.brukman.net/blog/2022/04/writing-math-with-hugo/)
1. [Emoji support](https://gohugo.io/quick-reference/emojis/)
1. [Using Local fonts HUGO](https://www.chrislockard.net/posts/using-local-fonts-hugo-academic-theme/)
1. [Shortcodes super useful](https://gohugo.io/content-management/shortcodes/)
