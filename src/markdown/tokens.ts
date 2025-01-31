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
  OrderedList,
  UnorderedList,
  ListItem,
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

export class OrderedListToken implements ContainerBlock {
  Kind(): TokenKind {
    return TokenKind.OrderedList;
  }

  Tokens(): Tokens {
    return this.tokens;
  }

  SetTokens(tokens: Tokens): void {
    this.tokens = tokens;
  }

  constructor(startNumber: string, delimitation: string) {
    this.startNumber = startNumber;
    this.delimitation = delimitation;
  }

  StartNumber() {
    return this.startNumber;
  }

  Delimitation() {
    return this.delimitation;
  }

  private tokens: Tokens = [];
  private startNumber: string;
  private delimitation: string;
}

export class UnorderedListToken implements ContainerBlock {
  Kind(): TokenKind {
    return TokenKind.UnorderedList;
  }

  Tokens(): Tokens {
    return this.tokens;
  }

  SetTokens(tokens: Tokens): void {
    this.tokens = tokens;
  }

  constructor(bullet: string) {
    this.bullet = bullet;
  }

  Bullet() {
    return this.bullet;
  }

  private tokens: Tokens = [];
  private bullet: string;
}

export class ListItemToken implements ContainerBlock {
  Kind(): TokenKind {
    return TokenKind.ListItem;
  }

  Tokens(): Tokens {
    return this.tokens;
  }

  SetTokens(tokens: Tokens): void {
    this.tokens = tokens;
  }

  constructor(offset: number) {
    this.offset = offset;
  }

  Offset() {
    return this.offset;
  }

  Tight() {
    return this.tight;
  }

  SetTight(flag: boolean) {
    this.tight = flag;
  }

  private tokens: Tokens = [];
  private offset: number;
  private tight: boolean = true;
}

export type orderedListItemPreifx = {
  startNumber: string,
  delimitation: string,
  offset: number
}

export type unorderedListItemPrefix = {
  bullet: string,
  offset: number,
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
    case TokenKind.OrderedList:
    case TokenKind.UnorderedList:
    case TokenKind.ListItem:
      return true;
    default:
      return false;
  }
}