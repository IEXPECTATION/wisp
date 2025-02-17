# Lectures1

## 自我介绍和项目介绍

嗨，大家好。我是吴呈。今天我想和大家分享一下我最近正在做的一个小项目，目前仅完成了一部分设想功能（干笑）。这个项目我给它起名为 wisp，设想的功能是一个静态博客生成器，与 hexo 和 hugo 类似。名字（呢）来源于 War3 中的小精灵的名字。在 Dota 中小精灵属于一个可以连接队友从而对队友进行辅助的英雄。我也希望这个项目能像小精灵对撰写博客的作者提供一些些小小的帮助。

## 引入主题

对于一个静态博客生成器，最需要的就是能够方便作者编写博文，并能快速转换成网页的文本格式，或者说是载体。幸运地是，Markdown 正如 hexo 和 hugo 这些前辈所选择的那样，足够满足我们的需求。所以，第一件重要的事就是编写一个 Markdown Parser。但在我开始编写 Markdown Parser 的时候，遇到了三个困扰我很久的问题。导致我反复重构代码，最后做了很多不少无用功。

## 第一个问题和第二个问题

第一个问题和第二个问题有一定相关性。第一个问题是，在 markdown 的 blockquote 支持一种 lazy paragraphs 的功能，这个功能可以只在第一行段落前使用 '>'，而后面的行不需要使用 '>'。因为这一特性，导致在判断 blockquote 的范围就非常困难。导致这原因的就是第二个问题，paragraphs 的范围很难确定。因此我去查阅了很多的开源项目。学习他们是怎么处理这些问题。其中包括 cmark， gomarkdown，marked，markdown-it，markdig，micromark，python-markdown 等等 (打开VSCode)。这些主流的解析器大致可以分为两种，一种是按照行来解析的，另一种则是按照块的方式来解析的。像 cmark，markdig 这些都是使用都是行作为单位进行解析。使用行作为解析的好处是每次只需要检查这一行的内容，无需关心下一行的内容。当作为代价，则需要在检查时判断上一个元素是不是已经被关闭了。并且在当前元素完成时关闭当前元素。这种方式比按块解析的方式好处在于，解析块的结束很困难。（演示 marked 和 gomarkdown）就是因为这个问题，我发现了 marked 和 gomarkdown 里有个关于 blockquote 的 Bug。不过在同样以块解析的 markdown-it 却没有出现这个问题。主要它用了一个数组来保存哪些行是 blockquote 的内容，哪些行是 lazy paragraphs。当它解析 blockquote 内容的时候，它会检查该行是不是 lazy paragraphs。如果是的话就返回，并重新从这行开始继续解析。但是 markdown-it 的缺点也毋庸置疑了，就是每行都需要检查很多遍。这种效率的浪费至少对我来说是无法接受的。所以我想了一个绝佳的办法，就是其实很难确定 paragraphs 的结束位置，除非我提前知道下一行是其他元素。但是按行解析就没有麻烦，所以为什么引入这个想法呢。当所有的元素都检查过了，那么我们就可以假定这一行是一个 paragraphs，所以如果上一个元素不是 paragraphs，我就新建一个 paragraphs 元素并且添加到队列里。如果上一个是 paragraphs，我们就把这一行添加到上一个 paragraphs 里就行了。（演示 markdown-it）其实我们可以看一下 markdown-it 是如何解决这个问题的。（自由发挥）。

## 第三个问题

（演示）而第三个问题是关于 Link reference definitions 的，这个元素比较特殊。它是用于定义一些应用内容的，该元素本身不会被渲染。只用当使用了该应用的标签的地方会被渲染。比较难受的是它的几个部分都是可以跨行。这导致除非看下一行，不然是真的无法确定这些行是否是 Link reference definitions。所以为了解决这个问题，我也是参考了 cmark 中的先将 Link reference definitions 假装是 Paragraphs。然后在添加其他元素的时候，检查上一个的元素是不是 Paragraphs，并且检查他是不是 Link reference definitions，如果是则将这个 Paragraphs 移除，并添加一个 Link reference definitions。这样就能在完成的接收了一个 Link reference definitions 的情况下去检查是不是 Link reference definitions。如果不是则还是保留为 Paragraphs。

## 结束语

（演示 cmark）最后我再演示一下 cmark 是怎么解析的吧。Ok，以上就是我在实现一个超简单的 Markdown 解析器遇到的三个主要问题。虽然它现在只支持很少的功能，但我会一直持续地开发它。直到它真的能用、好用为止。谢谢大家观看，Stay tune。

***abc***
