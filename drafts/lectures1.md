---
标题：【学习分享】我在造 markdown parser 轮子中遇到三个小问题。
时间：2024-06-25
---
# Lectures1

## 自我介绍和项目介绍

嗨，大家好。我是吴呈。今天我想和大家分享一下我最近在做的一个小项目。这个项目我给它起名为 wisp，设想的功能是一个静态博客生成器。名字来源与 War3 中的小精灵的名字。在

## 第一个问题

第一个问题和第二个问题有一定相关性。第一个问题是，在 markdown 中有一个元素叫 blockquote。这个 blockquote 支持一种 lazy paragraphs 的功能，这个功能可以只在第一行段落前使用 '>'，而后面的行不需要使用 '>'，

## 第二个问题

## 第三个问题
cmark: 目前标准
gomarkdown: blockquote 有问题

``` plain text
> asd
=====
```


marked: list 和 list item 有问题

``` plain text
1. abc
abc

   abc
abc
```