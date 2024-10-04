export enum Element {
  // Blocks
  BlankLine,
  Heading,
  Hr,
  BlockQuote,
  IndentedCode,
  FencedCode,
  Def,
  Paragraph,
  List,
  ListItem,

  // Inlines
  Text,
  Bold,
  Itatic,

}

export interface Token {
  readonly Kind: Element;
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

export interface DefToken extends Token {
  Label: string;
  Url: string;
  Title: string | undefined;
}

export interface ParagraphToken extends Token {
  Text: string;
}

export interface List extends Token {
  SequentialNumber: number;
  Tokens: ListItem[] | undefined;
}

export interface ListItem extends Token {
  Tokens: Tokens | undefined;
}

export class Scanner {
  constructor(input: string) {
    this.input = input;
  }

  Eos() {
    return this.offset == this.input.length;
  }

  Peek() {
    if (this.Eos()) {
      return undefined;
    }

    return this.input[this.offset];
  }

  Next(count: number = 1) {
    if (this.Eos()) {
      return undefined;
    }
    return this.input.substring(this.offset, this.offset + count);
  }

  Advance(count: number = 1) {
    this.offset += count;
  }

  Retreat(count: number = 1) {
    this.offset -= count;
  }

  Consume(char: string) {
    if (this.Peek() == char) {
      this.Advance();
      return true;
    }
    return false;
  }

  Anchor() {
    this.anchor = this.offset;
  }

  FlashBack() {
    this.offset = this.anchor;
  }

  private input: string;
  private offset: number = 0;
  private anchor: number = 0;
}

export function ScannerTestcases() {
}