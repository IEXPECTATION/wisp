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
  OrderedListItem,
  UnorderedListItem,
}

export class TokenSpan {
}

export interface Token {
  Kind(): TokenKind;
}

export type Tokens = Token[];

export interface LeafBlock extends Token {
  Content(): string;
  SetContent(content: string): void;
}

export interface ContainerBlock extends Token {
  Tokens(): Tokens;
  SetTokens(tokens: Tokens): void;
}

export class HeadingToken implements LeafBlock {
  constructor(level: number, content: string) {
    this.level = level;
    this.content = content;
  }

  Kind(): TokenKind {
    return TokenKind.Heading;
  }

  Content(): string {
    return this.content;
  }

  SetContent(content: string): void {
    this.content = content;
  }

  Level() {
    return this.level;
  }

  private level: number;
  private content: string;
}

export class HrToken implements LeafBlock {
  Kind(): TokenKind {
    return TokenKind.Hr;
  }

  Content(): string {
    return "";
  }

  SetContent(_: string): void {
  }
}

export class BlankLineToken implements LeafBlock {
  Kind(): TokenKind {
    return TokenKind.BlankLine;
  }

  Content(): string {
    return "";
  }

  SetContent(_: string): void {
  }
}

export class IndentedCodeToken implements LeafBlock {
  Kind(): TokenKind {
    return TokenKind.IndentedCode;
  }

  Content(): string {
    return this.content;
  }

  SetContent(content: string): void {
    this.content = content;
  }

  private content: string = "";
}

export class FencedCodeToen implements LeafBlock {
  constructor(bullet: string, count: number, offset: number, language?: string) {
    this.bullet = bullet;
    this.length = count;
    this.offset = offset;
    if (language) {
      this.language = language;
    }
  }

  Kind(): TokenKind {
    return TokenKind.FencedCode;
  }

  Content(): string {
    return this.content;
  }

  SetContent(content: string): void {
    this.content = content;
  }

  Lanuange(): string {
    return this.language;
  }

  Length(): number {
    return this.length;
  }

  Offset(): number {
    return this.offset;
  }

  Bullet(): string {
    return this.bullet;
  }

  Closed(): boolean {
    return this.closed;
  }

  Close(): void {
    this.closed = true;
  }

  private content: string = "";
  private language: string = "";
  private length: number;
  private offset: number;
  private bullet: string;
  private closed: boolean = false;
}

export class ReferenceToken implements LeafBlock {
  Kind(): TokenKind {
    return TokenKind.Reference;
  }

  Content(): string {
    throw new Error("Method not implemented.");
  }
  SetContent(content: string): void {
    throw new Error("Method not implemented.");
  }
}

export class ParagraphToken implements LeafBlock {
  constructor(content: string) {
    this.content = content;
  }

  Kind(): TokenKind {
    return TokenKind.Paragraph;
  }

  Content(): string {
    return this.content;
  }
  SetContent(content: string): void {
    this.content = content;
  }

  private content: string;
}

export class BlockQuoteToken implements ContainerBlock {
  Kind(): TokenKind {
    return TokenKind.BlockQuote;
  }

  Tokens(): Tokens {
    return this.tokens;
  }

  SetTokens(tokens: Tokens): void {
    this.tokens = tokens;
  }

  private tokens: Tokens = [];
}

export class ListToken implements ContainerBlock {
  Kind(): TokenKind {
    return TokenKind.List;
  }

  Tokens(): Tokens {
    return this.tokens;
  }

  SetTokens(tokens: Tokens): void {
    this.tokens = tokens;
  }

  constructor() {
  }

  private tokens: Tokens = [];

}

export class OrderedListItemToken implements ContainerBlock {
  Kind(): TokenKind {
    return TokenKind.OrderedListItem;
  }

  Tokens(): Tokens {
    return this.tokens;
  }

  SetTokens(tokens: Tokens): void {
    this.tokens = tokens;
  }

  constructor(startNumber: number, offset: number) {
    this.startNumber = startNumber;
    this.offset = offset;
  }

  StartNumber() {
    return this.startNumber;
  }

  Offset() {
    return this.offset;
  }

  private tokens: Tokens = [];
  private startNumber: number;
  private offset: number;
}

export class UnorderedListItemToken implements ContainerBlock {
  Kind(): TokenKind {
    return TokenKind.OrderedListItem;
  }

  Tokens(): Tokens {
    return this.tokens;
  }

  SetTokens(tokens: Tokens): void {
    this.tokens = tokens;
  }

  constructor(bullet: string, offset: number) {
    this.bullet = bullet;
    this.offset = offset;
  }

  Bullet() {
    return this.bullet;
  }

  Offset() {
    this.offset;
  }

  private tokens: Tokens = [];
  private bullet: string;
  private offset: number;
}


export function isLeafBlock(token: Token): token is LeafBlock {
  switch (token.Kind()) {
    case TokenKind.BlankLine:
    case TokenKind.Heading:
    case TokenKind.Hr:
    case TokenKind.IndentedCode:
    case TokenKind.FencedCode:
    case TokenKind.Reference:
    case TokenKind.Paragraph:
      return true;
    default:
      return false;
  }
}

export function isContainerBlock(token: Token): token is ContainerBlock {
  switch (token.Kind()) {
    case TokenKind.BlockQuote:
    case TokenKind.List:
    case TokenKind.OrderedListItem:
    case TokenKind.UnorderedListItem:
      return true;
    default:
      return false;
  }
}