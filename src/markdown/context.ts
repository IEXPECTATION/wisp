export type Context = OrderedListContext | UnorderedListContext | ListItemContext | HeadingContext | IndentedCodeContext | FencedCodeContext | HtmlBlockContext | LinkReferenceDefinitionContext;

type Location = {
  row: number,
  column: number,
  start: number;
  end: number;
};

type OrderedListContext = {
  location: Location,
  sn: number,
  offset: number,
}

type UnorderedListContext = {
  location: Location;
  bullet: number,
  offset: number,
}

type ListItemContext = {
  location: Location,
  tiny: boolean,
}

type BlockQuoteContext = {
  location: Location,
}

type ThematicBreakContext = {
  location: Location,
}

type HeadingContext = {
  location: Location,
  level: number,
}

type IndentedCodeContext = {
  location: Location[],
  padding: number,
}

type FencedCodeContext = {
  location: Location[],
  bullet: string,
  length: number,
  offset: number,
}

type HtmlBlockContext = {
  location: Location,
  tab_name: string,
}

type LinkReferenceDefinitionContext = {
  
}
