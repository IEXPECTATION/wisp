import { Node } from "./node"

export type Context = OrderedListContext | UnorderedListContext | ListItemContext | BlockQuoteContext | ThematicBreakContext | HeadingContext | IndentedCodeContext | FencedCodeContext | HtmlBlockContext | LinkReferenceDefinitionContext | ParagraphContext;

export type Location = {
  row: number,
  column: number,
  start: number;
  end: number;
};

export type OrderedListContext = {
  location: Location,
  sn: number,
  tiny: boolean,
}

export type UnorderedListContext = {
  location: Location;
  bullet: string,
  offset: number,
  tiny: boolean,
}

export type ListItemContext = {
  parent: Node,
}

export type BlockQuoteContext = {
  location: Location,
}

export type ThematicBreakContext = {
  location: Location,
}

export type HeadingContext = {
  locations: Location[],
  level: number,
}

export type IndentedCodeContext = {
  lines: { location: Location, padding: number }[]
}

export type FencedCodeContext = {
  lines: { location: Location, padding: number }[],
  bullet: string,
  length: number,
  offset: number,
  language: Location,
}

export type HtmlBlockContext = {
  location: Location,
  tab_name: string,
}

export type LinkReferenceDefinitionContext = {
  location: Location,
}

export type ParagraphContext = {
  locations: Location[],
}
