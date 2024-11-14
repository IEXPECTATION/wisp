export enum TokenKind {
  // Blocks
  BlankLine,
  Heading,
  Hr,
  BlockQuote,
  IndentedCode,
  FencedCode,
  Reference,
  Paragraph,
  List,
  ListItem,
}

export interface Token {
  readonly Kind: TokenKind;
}

export type Tokens = Token[];

export interface HeadingToken extends Token {
  Text: string,
  Level: number
}

export interface HrToken extends Token {
}

export interface BlockQuoteToken extends Token {
  Tokens: Tokens;
}

export interface BlankLineToken extends Token {
}

export interface IndentedCodeToken extends Token {
  Code: string;
}

export enum SupportedLanguage {
  C,
  CXX,
  Java,
  Python,
  Rust,
  Javascript,
  Typescript,
}

export interface FencedCodeToen extends Token {
  Code: string;
  Language: string; // TODO: Change type of `Language` from string to enum.
}

export interface ReferenceToken extends Token {
  Label: string;
  Url: string;
  Title: string;
  Bullet: string;
  Raw: string,
  Completed: boolean;
}

export interface ParagraphToken extends Token {
  Text: string;
}

export interface ListToken extends Token {
  SequentialNumber: number;
  Tokens: ListItemToken[];
}

export interface ListItemToken extends Token {
  Tokens: Tokens;
}
