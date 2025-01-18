import { Scanner } from "./scanner";
import { BlankLineToken, BlockQuoteToken, ContainerBlock, FencedCodeToen, HeadingToken, HrToken, IndentedCodeToken, ParagraphToken, Token, TokenKind, Tokens, LeafBlock, TokenSpan, isLeafBlock, isContainerBlock } from "./tokens";
import { Node, NodeTag } from "./nodes";
import { assert } from "console";

export interface PasrerConfig {
  TAB_SIZE?: number;
};

export function MakeDefaultParserConfig() {

}

export class Parser {
  // Return a ast of markdown document. This ast can be passed to a renderer.
  Parse(input: string) {
    this.input = input;
    this.parseBlocks();
    let document = new Node(NodeTag.Document);
    this.parseInlines(document, this.tokens);
    return document;
  }

  private parseBlocks() {
    let scanner = new Scanner(this.input);
    let matched = null;

    while (!scanner.End()) {
      this.indent = this.whiteSpace(scanner);

      matched = this.containerBlcoks(scanner);

      if (matched) {
        this.leafBlocks(matched.Tokens(), scanner);
      } else {
        let newTokens: Tokens = [];
        this.leafBlocks(newTokens, scanner);
        this.tokens.push(...newTokens)
      }
    }
  }

  private parseInlines(node: Node, tokens: Tokens) {
    for (let token of tokens) {
      this.inlines(node, token);
    }
  }

  private containerBlcoks(scanner: Scanner): ContainerBlock | null {
    let matched: ContainerBlock | null = null;
    let token = null;
    let tokens = this.tokens;
    while (true) {
      if (this.indent < this.TAB_SIZE && (token = this.blockQuote(tokens, scanner)) != null) {
        tokens = token.Tokens();
        matched = token;
        continue;
      }

      break;
    }

    return matched;
  }

  private leafBlocks(tokens: Tokens, scanner: Scanner) {
    if (this.indent < this.TAB_SIZE) {
      if (this.heading(tokens, scanner)) {
        return;
      } else if (this.setextHeading(tokens, scanner)) {
        return;
      } else if (this.blankline(tokens, scanner)) {
        return;
      } else if (this.hr(tokens, scanner)) {
        return;
      } else if (this.fencedCode(tokens, scanner)) {
        return;
      } else {
        this.paragraph(tokens, scanner);
        return;
      }
    } else {
      if (this.indentedCode(tokens, scanner)) {
        return;
      }
    }

    assert(false, "Could not reach here.")
  }



  private headingLevel(scanner: Scanner) {
    let count = 0;
    while (count <= 6) {
      if (scanner.Consume('#')) {
        count += 1;
      } else {
        break;
      }
    }

    return count;
  }

  private heading(tokens: Tokens, scanner: Scanner) {
    scanner.Push();
    let level = this.headingLevel(scanner);
    if (level == 0) {
      scanner.Pop();
      return false;
    }

    if (!scanner.Consume(' ')) {
      scanner.Pop();
      return false;
    }

    let text = this.readLine(scanner);
    this.appendToken(tokens, new HeadingToken(level, text));

    scanner.Clear();
    return true;
  }

  private setextHeading(tokens: Tokens, scanner: Scanner) {
    let lastToken = this.findLastTargetToken(TokenKind.Paragraph, tokens) as ParagraphToken;
    if (lastToken == null) {
      return false;
    }

    scanner.Push();
    let bullet = scanner.Next();

    if (bullet != '=' && bullet != '-') {
      scanner.Pop();
      return false;
    }

    let count = 1;
    while (!scanner.End()) {
      if (this.eol(scanner)) {
        break;
      }

      if (!scanner.Consume(bullet)) {
        break;
      }

      count += 1;
    }

    if (count < 3) {
      scanner.Pop();
      return false;
    }

    tokens.pop();
    tokens.push(new HeadingToken(bullet == '=' ? 1 : 2, lastToken.Content()))
    scanner.Clear();
    return true;
  }

  private blankline(tokens: Tokens, scanner: Scanner) {
    if (scanner.End()) {
      return false;
    }

    scanner.Push();
    while (!scanner.End()) {
      if (this.eol(scanner)) {
        break;
      }

      if (!(scanner.Consume(' ') || (scanner.Consume('\t')))) {
        scanner.Pop();
        return false;
      }
    }

    this.appendToken(tokens, new BlankLineToken());

    scanner.Clear();
    return true;
  }

  private hr(tokens: Tokens, scanner: Scanner) {
    scanner.Push();
    let count = 0;

    while (!scanner.End()) {
      if (this.eol(scanner)) {
        break;
      }

      if (scanner.Consume('*') ||
        scanner.Consume('-') ||
        scanner.Consume('_')) {
        count += 1;
        continue;
      }

      if (scanner.Consume(' ') || scanner.Consume('\t')) {
        continue;
      }

      scanner.Pop();
      return false;
    }

    if (count >= 3) {
      this.appendToken(tokens, new HrToken());
      scanner.Clear();
      return true;
    }

    scanner.Pop();
    return false;
  }

  private fencedCode(tokens: Tokens, scanner: Scanner) {
    let lastToken = this.findLastTargetToken(TokenKind.FencedCode, tokens) as FencedCodeToen;
    if (lastToken && !lastToken.Closed()) {
      let fenced = lastToken;
      let bullet = fenced.Bullet();
      let count = fenced.Length();
      let offset = fenced.Offset();

      scanner.Push();
      let endCount = 0;
      while (!scanner.End() && scanner.Consume(bullet)) {
        endCount += 1;
      }

      if (endCount >= count) {
        this.skipLine(scanner);
        fenced.Close();
      } else {
        scanner.Pop();
        fenced.SetContent(fenced.Content() + " ".repeat(Math.max(0, this.indent - offset)) + this.readLine(scanner));
      }
    } else {
      scanner.Push();
      let offset = this.indent;
      let bullet = scanner.Next();
      if (bullet != '~' && bullet != '`') {
        scanner.Pop();
        return false;
      }
      let count = 1;
      while (!scanner.End() && scanner.Consume(bullet)) {
        count += 1;
      }
      if (count < 3) {
        scanner.Pop();
        return false;
      }

      // TODO: Recognize the language of code.
      this.skipLine(scanner);

      this.appendToken(tokens, new FencedCodeToen(bullet, count, offset));
      scanner.Clear();
    }

    return true;
  }

  private indentedCode(tokens: Tokens, scanner: Scanner) {
    let lastToken = this.lastToken(this.tokens);
    if (lastToken && lastToken.Kind() == TokenKind.IndentedCode) {
      let indented = lastToken as IndentedCodeToken;
      indented.SetContent(indented.Content() + "".repeat(Math.max(0, this.indent - 4)) + this.readLine(scanner));
    } else {
      let indented = new IndentedCodeToken();
      indented.SetContent("".repeat(Math.max(0, this.indent - 4)) + this.readLine(scanner));
      this.appendToken(tokens, indented);
    }

    return true;
  }

  private paragraph(tokens: Tokens, scanner: Scanner) {
    let lastToken = this.findLastTargetToken(TokenKind.Paragraph, tokens) as ParagraphToken;

    let line = this.readLine(scanner);
    if (lastToken != null) {
      lastToken.SetContent(lastToken.Content() + line);
      return;
    }

    this.appendToken(tokens, new ParagraphToken(line));
  }

  private blockQuote(tokens: Tokens, scanner: Scanner) {
    let lastToken: ContainerBlock | null = null;
    while (scanner.Consume('>')) {
      lastToken = this.findLastTargetToken(TokenKind.BlockQuote, tokens) as BlockQuoteToken;
      if (lastToken == null) {
        lastToken = new BlockQuoteToken();
        this.appendToken(tokens, lastToken);
      }
      tokens = lastToken.Tokens();
    }

    if (lastToken != null) {
      scanner.Consume(' ');
    }

    if (lastToken) {
      this.indent = this.whiteSpace(scanner);
    }
    return lastToken;
  }

  private inlines(root: Node, token: Token) {
    let node = null;
    switch (token.Kind()) {
      case TokenKind.BlankLine:
        return;
      case TokenKind.Heading: {
        let heading = token as HeadingToken;
        switch (heading.Level()) {
          case 1:
            node = new Node(NodeTag.H1);
            break;

          case 2:
            node = new Node(NodeTag.H2);
            break

          case 3:
            node = new Node(NodeTag.H3);
            break;

          case 4:
            node = new Node(NodeTag.H4);
            break;

          case 5:
            node = new Node(NodeTag.H5);
            break;

          case 6:
            node = new Node(NodeTag.H6);
            break;
        }

        if (node == null) {
          throw new Error("Unknown heading level!");
        }

        // TODO:
        this.inline(node, heading.Content());
      }
        break;
      case TokenKind.Hr: {
        root.SetChild(new Node(NodeTag.Hr));
      }
        break;
      case TokenKind.BlockQuote: {
        node = new Node(NodeTag.BlockQuote);
        let blockquote = token as BlockQuoteToken;
        this.parseInlines(node, blockquote.Tokens());
      }
        break;
      case TokenKind.IndentedCode:
      case TokenKind.FencedCode: {
        let leafBlock = token as LeafBlock;
        let node = new Node(NodeTag.Code);
        node.SetText(leafBlock.Content());
      }
        break;
      case TokenKind.Reference: {
        // TODO:
      }
        break;
      case TokenKind.Paragraph: {
        let paragraph = token as ParagraphToken;
        let node = new Node(NodeTag.Paragraph);
        node.SetText(paragraph.Content());
      }
        break;
      case TokenKind.List: {
        // TODO:
      }
        break;
      case TokenKind.ListItem: {
        // TODO:
      }
        break;
      default: {
        throw new Error("Unknown token kind!");
      }
    }

    root.SetChild(node!);
  }

  private inline(node: Node, content: string) {
    let text = new Node(NodeTag.Text);
    text.SetText(content);
    node.SetChild(text);
  }



  private appendToken(tokens: Tokens, token: Token) {
    // TODO: check the last token is paragraph or not.

    tokens.push(token);
  }

  private lastToken(tokens: Tokens) {
    if (tokens.length > 0) {
      return tokens[tokens.length - 1];
    }

    return null;
  }

  private findLastTargetToken(kind: TokenKind, tokens: Tokens): Token | null {
    let lastToken = this.lastToken(tokens);

    if (lastToken) {
      if (lastToken.Kind() == kind) {
        return lastToken;
      }

      if (isContainerBlock(lastToken)) {
        return this.findLastTargetToken(kind, lastToken.Tokens());
      }
    }

    return null;
  }

  private readLine(scanner: Scanner) {
    let line = "";
    while (!scanner.End()) {
      if (this.eol(scanner)) {
        line += "\n";
        break;
      }

      line += scanner.Peek();
      scanner.Skip();
    }

    return line;
  }

  private skipLine(scanner: Scanner) {
    while (!(scanner.End() || this.eol(scanner))) {
      scanner.Skip();
    }
  }

  private eol(scanner: Scanner) {
    assert(!scanner.End());

    let peek = scanner.Peek();
    if (peek == '\n') {
      scanner.Skip();
      return true;
    } else if (peek == '\r') {
      if (scanner.Next() == '\n') {
        scanner.Skip();
      }

      return true;
    }

    return false;
  }

  private whiteSpace(scanner: Scanner): number {
    let count = 0;
    while (!scanner.End()) {
      if (scanner.Consume(' ')) {
        count += 1;
      } else if (scanner.Consume('\t')) {
        count += 4;
      } else {
        break;
      }
    }

    return count;
  }


  private input: string = "";
  private tokens: Tokens = [];
  private indent: number = 0;

  private TAB_SIZE: number = 4;
}
