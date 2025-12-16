type Context = OrderedListContext | UnorderedListContext | ListItemContext | HeadingContext |  FencedCodeContext | HtmlBlockContext | LinkReferenceDefinitionContext;


type OrderedListContext = {
  sn: number,
  offset: number,
}

type UnorderedListContext = {
  bullet: number,
  offset: number,
}

type ListItemContext = {
  tiny: boolean,
}

type HeadingContext = {
  level: number
}

type FencedCodeContext = {
  bullet: string,
  length: number,
  offset: number,
}

type HtmlBlockContext = {
  tab_name: string,
}

type LinkReferenceDefinitionContext = {
  
}
