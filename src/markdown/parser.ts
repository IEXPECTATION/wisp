import { Scanner } from "./scanner";
import { BlockQuoteToken, FencedCodeToen, HeadingToken, IndentedCodeToken, ListItemToken, ListToken, ParagraphToken, ReferenceToken, Token, TokenKind, Tokens } from "./tokens";
import { Node, NodeTag } from "./nodes";
import { EOL } from "os";

export interface PasrerConfig {
  TAB_SIZE?: number;
};

export function MakeDefaultParserConfig() {

}

const TAB_SIZE = 4;

export class Parser {
  constructor(config: PasrerConfig) {
    this.config = config;
  }

  Parse(input: string) {
    let scanner = new Scanner(input);
    let tokens = this.parseBlocks(scanner);
    let document = new Node(NodeTag.Document);
    this.parseInlines(document, tokens);
    return document;
  }

  private parseBlocks(scanner: Scanner) {
    let tokens: Tokens = [];
    while (!scanner.Eos()) {
      if (this.blankline(tokens, scanner)) {
        continue;
      }

      let whitespace = this.whiteSpace(scanner);
      if (whitespace >= TAB_SIZE) {
        if (this.indentedCode(tokens, scanner)) {
          let el = tokens[tokens.length - 1];
          //  If the number of whitespace is larger than TAB_SIZE, we should add the extra whitespace to code for first line.
          (el as IndentedCodeToken).Code = " ".repeat(whitespace - TAB_SIZE) + (el as IndentedCodeToken).Code;
          continue;
        }
        throw new Error("Unknown element of markdown!");
      }

      if (this.heading(tokens, scanner)) {
        continue;
      }

      if (this.blockQuote(tokens, scanner)) {
        continue;
      }

      if (this.fencedCode(tokens, scanner)) {
        continue;
      }

      if (this.hr(tokens, scanner)) {
        continue;
      }

      if (this.reference(tokens, scanner)) {
        continue;
      }

      if (this.paragraph(tokens, scanner)) {
        continue;
      }
    }
    return tokens;
  }

  private parseInlines(root: Node, targets: Tokens) {
    for (let token of targets) {
      this.inlines(root, token);
    }
  }

  private inlines(root: Node, target: Token) {
    switch (target.Kind) {
      case TokenKind.BlankLine:
        return;

      case TokenKind.Heading: {
        let heading = undefined;
        let token = target as HeadingToken;
        switch (token.Level) {
          case 1:
            heading = new Node(NodeTag.H1);
            break;
          case 2:
            heading = new Node(NodeTag.H2);
            break;
          case 3:
            heading = new Node(NodeTag.H3);
            break;
          case 4:
            heading = new Node(NodeTag.H4);
            break;
          case 5:
            heading = new Node(NodeTag.H5);
            break;
          case 6:
            heading = new Node(NodeTag.H6);
            break;
          default:
            throw new Error("Unknown heading level!");
        }
        this.inline(heading, token.Text);
        root.SetChild(heading);
      }
        return;

      case TokenKind.Hr: {
        let hr = new Node(NodeTag.Hr);
        root.SetChild(hr);
      }
        return;

      case TokenKind.BlockQuote: {
        let blockquote = new Node(NodeTag.BlockQuote);
        this.parseInlines(blockquote, (target as BlockQuoteToken).Tokens);
        root.SetChild(blockquote);
      }
        return;

      case TokenKind.IndentedCode:
      case TokenKind.FencedCode: {
        let code = new Node(NodeTag.Code);
        this.inline(code, (target as IndentedCodeToken).Code);
        root.SetChild(code);
      }
        return;

      case TokenKind.Reference: {
        let token = target as ReferenceToken;
        if (token.Completed) {

          return;
        }

        let paragraph = new Node(NodeTag.Paragraph);
        this.inline(paragraph, (target as ParagraphToken).Text);
        root.SetChild(paragraph);
      }
        return;

      case TokenKind.Paragraph: {
        let paragraph = new Node(NodeTag.Paragraph);
        this.inline(paragraph, (target as ParagraphToken).Text);
        root.SetChild(paragraph);
      }
        return;

      case TokenKind.List:
        return;

      case TokenKind.ListItem:
        return;

      default:
        throw new Error("Unknow TokenKind!");
    }
  }

  private inline(root: Node, text: string) {
    let context = {
      index: 0,
      text
    };

    if (text[text.length - 1] == '\n') {
      text = text.substring(0, text.length - 1);
    }

    while (context.index < text.length) {
      if (this.codeSpan(root, context)) {
        continue;
      }

      this.text(root, context.text[context.index]);
      context.index += 1;
    }
  }

  private codeSpan(root: Node, context: { index: number, text: string }) {
    if (context.text[context.index] != '`') {
      return false;
    }

    context.index += 1;
    let count = 1;
    if (context.text[context.index + 1] == '`') {
      count += 1;
      context.index += 1;
    }
    // Check the next chacter that is alos '`'
    root.SetChild(this.processCodeSpan(context, count));

    return true;
  }

  private processCodeSpan(context: { index: number, text: string }, count: number) {
    let { index, text } = context;
    // Skip a whitespace at the beginning of text.
    let frontWhiteSpace = 0;

    let code = "";
    while (text[index] == ' ') {
      frontWhiteSpace += 1;
      index += 1;
    }

    let backWhiteSpace = 0;
    while (index < text.length) {
      if (text[index] == '`') {
        if (text[index + 1] == '`') {
          if (count == 2) {
            index += 2;
            break;
          }

          // Add the current backtick to the code to avoid checking the second backtick in the next loop.
          code += text[index];
          index += 1;
        } else {
          if (count == 1) {
            index += 1;
            break;
          }
        }
      } else if (text[index] == ' ') {
        backWhiteSpace += 1;
        index += 1;
        continue;
      } else if (text[index] == '\n') {
        code += ' ';
        index += 1;
        continue;
      }

      backWhiteSpace = 0;
      code += text[index];
      index += 1;
    }

    if (frontWhiteSpace > 0 && backWhiteSpace > 0) {
      frontWhiteSpace -= 1;
      backWhiteSpace -= 1;
    }

    code = ' '.repeat(frontWhiteSpace) + code + ' '.repeat(backWhiteSpace);
    let node = new Node(NodeTag.CodeSpan);
    node.SetText(code);
    context.index = index;
    return node;
  }

  private softbreak(root: Node, context: { index: number, text: string }) {

  }

  private text(root: Node, c: string) {
    let children = root.Children();
    if (children.length == 0 || children[children.length - 1].Tag != NodeTag.Text) {
      let text = new Node(NodeTag.Text);
      text.SetText(c);
      root.SetChild(text);
      return;
    }

    let text = children[children.length - 1];
    text.SetText(text.Text() + c);
  }

  private emphasis(root: Node, index: number, text: string) {
    let bullet = text[index];
    let start = 0;
    let i = index
    while (text[i] == bullet) {
      i += 1;
      start += 1;
    }

    if (start > 3) {
      // TODO: This may a empty emphasis.
    }

    if (bullet == '_') {
      if (text[i + 1] == ' ') {
        i += 1;
      } else {
        return index;
      }
    }

    let emphasis = "";
    let anthor = 0;
    let end = 0;
    while (i < text.length) {
      if (bullet == '_') {
        anthor = i;
        while (text[anthor] == ' ' && text[i + 1] == '_') {
          i += 1;
          end += 1;
        }

        if (end != start) {
          i = anthor;
        } else {
          let em = new Node(NodeTag.Block + end - 1);
          em.SetText(emphasis);
          root.SetChild(em);
          return i;
        }
      }

      if (bullet == '*') {
        anthor = i;
        while (text[i] == '*') {
          i += 1;
          end += 1;
        }

        if (end != start) {
          i = anthor;
        } else {
          let em = new Node(NodeTag.Block + end - 1);
          em.SetText(emphasis);
          root.SetChild(em);
          return i;
        }
      }

      emphasis += text[i];
      i += 1;
      end = 0;
    }

    return index;
  }

  private blankline(tokens: Tokens, scanner: Scanner) {
    if (scanner.Eos()) {
      return false;
    }

    scanner.Anchor();
    while (!this.eol(scanner)) {
      if (!(scanner.Consume(' ') || (scanner.Consume('\t')))) {
        scanner.FlashBack();
        return false;
      }
    }

    tokens.push({
      Kind: TokenKind.BlankLine
    });
    return true;

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
    scanner.Anchor();
    let level = this.headingLevel(scanner);
    if (level == 0) {
      return false;
    }

    if (!scanner.Consume(' ')) {
      scanner.FlashBack();
      return false;
    }

    let text = "";
    while (!this.eol(scanner)) {
      text += scanner.Peek();
      scanner.Advance();
    }

    tokens.push({ Kind: TokenKind.Heading, Text: text, Level: level } as HeadingToken)
    return true;
  }

  private getPreviousBlockquote(targets: Tokens): BlockQuoteToken | null {
    if (targets.length == 0) {
      return null;
    }

    let last = targets[targets.length - 1];
    if (last.Kind == TokenKind.BlockQuote) {
      return last as BlockQuoteToken;
    } else if (last.Kind == TokenKind.List) {
      return this.getPreviousBlockquote((last as ListToken).Tokens);
    } else if (last.Kind == TokenKind.ListItem) {
      return this.getPreviousBlockquote((last as ListItemToken).Tokens);
    }

    return null;
  }

  private blockQuote(tokens: Tokens, scanner: Scanner) {
    let previousPrefix = 0;
    while (scanner.Consume('>')) {
      previousPrefix += 1;
    }

    if (previousPrefix == 0) {
      return false;
    }

    scanner.Consume(' ');

    let previousBlockQuote = this.getPreviousBlockquote(tokens);

    if (previousBlockQuote == null) {
      previousBlockQuote = { Kind: TokenKind.BlockQuote, Tokens: [] };
      tokens.push(previousBlockQuote);
    }

    for (let i = 0; i < previousPrefix - 1; i += 1) {
      if (previousBlockQuote.Tokens.length > 0) {
        let last = previousBlockQuote.Tokens[previousBlockQuote.Tokens.length - 1];
        if (last.Kind == TokenKind.BlockQuote) {
          previousBlockQuote = last as BlockQuoteToken;
        }
      }

      let blockquote: BlockQuoteToken = { Kind: TokenKind.BlockQuote, Tokens: [] };
      previousBlockQuote.Tokens.push(blockquote);
      previousBlockQuote = blockquote;
    }

    let chunk = "";
    let prefix = 0;
    while (!scanner.Eos()) {
      while (!this.eol(scanner)) {
        chunk += scanner.Peek();
        scanner.Advance();
      }
      chunk += '\n';
      while (scanner.Consume('>')) {
        prefix += 1;
      }

      if (prefix != previousPrefix) {
        scanner.Retreat(prefix);
        break;
      }
      prefix = 0;
    }

    let subTokens = this.parseBlocks(new Scanner(chunk));
    if (subTokens.length == 0) {
      // TODO: Throw an error.
      return false;
    }

    for (let subToken of subTokens) {
      if (subToken.Kind == TokenKind.Paragraph) {
        let last = this.getLastParagraph(previousBlockQuote.Tokens);
        if (last != null) {
          last.Text += (subToken as ParagraphToken).Text;
          continue;
        }
      }

      previousBlockQuote.Tokens.push(subToken);
    }

    return true;
  }

  private indentedCode(tokens: Tokens, scanner: Scanner) {
    let line = "";
    let whitespace = 0;

    while (!scanner.Eos()) {
      while (!this.eol(scanner)) {
        line += scanner.Peek();
        scanner.Advance();
      }
      line += '\n';

      whitespace = this.whiteSpace(scanner);
      if (whitespace < TAB_SIZE) {
        scanner.Retreat(whitespace);
        break;
      }

      // Add the remaining whitespace if leading whitespace is larger than TAB_SIZE
      line += " ".repeat(whitespace - TAB_SIZE);
    }

    tokens.push({ Kind: TokenKind.IndentedCode, Code: line } as IndentedCodeToken);
    return true;
  }

  private hr(tokens: Tokens, scanner: Scanner) {
    scanner.Anchor();
    let count = 0;

    while (!this.eol(scanner)) {
      if (scanner.Consume('*') ||
        scanner.Consume('-') ||
        scanner.Consume('_')) {
        count += 1;
        continue;
      }

      if (scanner.Consume(' ') || scanner.Consume('\t')) {
        continue;
      }

      scanner.FlashBack();
      return false;
    }

    if (count >= 3) {
      tokens.push({ Kind: TokenKind.Hr });
      return true;
    }

    scanner.FlashBack();
    return false;
  }

  private fencedCode(tokens: Tokens, scanner: Scanner) {
    scanner.Anchor();
    let bullet = ""
    if (scanner.Consume('`')) {
      bullet = '`';
    } else if (scanner.Consume('~')) {
      bullet = '~';
    } else {
      return false;
    }

    let startCount = 1;
    let eol = true;

    while (!this.eol(scanner)) {
      if (scanner.Consume(bullet)) {
        startCount += 1;
      } else if (eol) {
        eol = false;
        break;
      } else {
        console.assert(0, "This line should not be reached.")
      }
    }

    if (startCount < 3 || scanner.Eos()) {
      scanner.FlashBack();
      return false;
    }

    // Recognize the language of fenced code element.
    let language = "";
    if (!eol) {
      this.whiteSpace(scanner);
      while (!this.eol(scanner)) {
        let peek = scanner.Peek();
        if (peek == ' ' || peek == '\t') {
          continue;
        }

        language += peek;
        scanner.Advance();
      }
    }

    // Recognize the body of fenced code element.
    let code = "";
    let endCount = 0;
    while (!scanner.Eos()) {
      let peek = scanner.Peek();
      if (peek == bullet) {
        while (scanner.Consume(bullet)) {
          endCount += 1;
        }

        if (endCount >= startCount) {
          break;
        }
      }

      code += peek;
      scanner.Advance();
    }

    tokens.push({ Kind: TokenKind.FencedCode, Code: code, Language: language } as FencedCodeToen);
    return false;
  }

  // TODO: Needs refactor in the future. The code is very ugly.
  private reference(tokens: Tokens, scanner: Scanner) {
    let raw = "";
    if (tokens.length >= 1) {
      let last = tokens[tokens.length - 1];
      if (last.Kind == TokenKind.Paragraph) {
        return false;
      } else if (last.Kind == TokenKind.Reference) {
        let element = last as ReferenceToken;
        if (element.Url == "") {
          while (!this.eol(scanner)) {
            let peek = scanner.Peek();
            scanner.Advance();
            raw += peek;

            if (peek == ' ' || peek == '\t') {
              break;
            }
          }

          let url = "";
          while (!this.eol(scanner)) {
            let peek = scanner.Peek();
            if (peek == ' ' || peek == '\t') {
              break;
            }

            raw += peek;
            url += peek;
            scanner.Advance();
          }

          if (url != "") {
            element.Url = url;
            return true;
          }

          return false;
        }

        if (!element.Completed) {
          if (element.Title == "") {
            while (!this.eol(scanner)) {
              let peek = scanner.Peek();
              scanner.Advance();
              raw += peek;

              if (peek == ' ' || peek == '\t') {
                break;
              }

              if (!this.eol(scanner) && peek != '\"' && peek != '\'') {
                return false;
              }
            }
            element.Bullet = scanner.Peek()!;
            element.Raw += raw;
          }

          let bullet = element.Bullet;
          let title = "";
          let completed = true;

          let peek = scanner.Peek();
          while (peek != bullet) {
            title += peek;
            scanner.Advance();
            peek = scanner.Peek();

            if (this.eol(scanner)) {
              completed = false;
              break;
            }
          }

          element.Title += title;

          if (completed) {
            scanner.Advance();
            element.Raw += title + bullet;
            element.Completed = true;
            // Skip the extra white space following.
            this.whiteSpace(scanner);
          }
        }
        return true;
      }
    }

    scanner.Anchor();
    if (!scanner.Consume('[')) {
      return false;
    }

    let label = "";
    while (!scanner.Consume(']')) {
      let peek = scanner.Peek();
      if (peek == '\\') {
        label += peek;
        scanner.Advance();
        peek = scanner.Peek();
      }

      if (peek == '\n') {
        scanner.FlashBack();
        return false;
      }

      label += peek;
      scanner.Advance();

      if (scanner.Eos()) {
        scanner.FlashBack();
        return false;
      }
    }

    if (!scanner.Consume(':')) {
      scanner.FlashBack();
      return false;
    }
    raw = '[' + label + ']:'

    raw += ' '.repeat(this.whiteSpace(scanner));

    let url = "";
    while (!this.eol(scanner)) {
      let peek = scanner.Peek();
      if (peek == ' ' || peek == '\t') {
        break;
      }

      raw += peek;
      url += peek;
      scanner.Advance();
    }

    if (url == "") {
      tokens.push({ Kind: TokenKind.Reference, Url: url, Title: "", Raw: raw, Completed: false } as ReferenceToken)
      return true;
    }

    raw += ' '.repeat(this.whiteSpace(scanner));

    // The title is optional.
    let title = "";
    let completed = true;
    let peek = scanner.Peek();

    if (!this.eol(scanner) && peek != '\"' && peek != '\'') {
      return false;
    }

    let bullet = peek;
    scanner.Advance();
    peek = scanner.Peek();
    while (peek != bullet) {
      title += peek;
      scanner.Advance();
      peek = scanner.Peek();

      if (this.eol(scanner)) {
        completed = false;
        break;
      }
    }

    if (completed) {
      scanner.Advance();
      raw += bullet + title + bullet;
      this.whiteSpace(scanner);
    } else {
      title += '\n';
      raw += bullet + title + '\n';
    }

    tokens.push({ Kind: TokenKind.Reference, Url: url, Title: title, Raw: raw, Bullet: bullet, Completed: completed } as ReferenceToken)
    return true;
  }

  private setextHeading(scanner: Scanner): number {
    let bullet = scanner.Peek();
    if (bullet != '=' && bullet != '-') {
      return 0;
    }

    let count = 1;
    while (!this.eol(scanner)) {
      if (!scanner.Consume(bullet)) {
        return 0;
      }
      count += 1;
    }

    if (count >= 3) {
      return bullet == '=' ? 1 : 2;
    }
    return 0;
  }

  private getLastParagraph(targets: Tokens): ParagraphToken | null {
    if (targets.length == 0) {
      return null;
    }

    let last = targets[targets.length - 1];
    if (last.Kind == TokenKind.Paragraph) {
      return last as ParagraphToken;
    } else if (last.Kind == TokenKind.BlockQuote) {
      return this.getLastParagraph((last as BlockQuoteToken).Tokens);
    } else if (last.Kind == TokenKind.List) {
      return this.getLastParagraph((last as ListToken).Tokens);
    } else if (last.Kind == TokenKind.ListItem) {
      return this.getLastParagraph((last as ListItemToken).Tokens);
    }

    return null;
  }

  private paragraph(tokens: Tokens, scanner: Scanner) {
    let text = "";

    while (!this.eol(scanner)) {
      text += scanner.Peek();
      scanner.Advance();
    }
    text += '\n';

    let last = this.getLastParagraph(tokens);

    let level = this.setextHeading(scanner);
    if (level != 0) {
      if (last) {
        text = (last as ParagraphToken).Text + text;
        tokens.pop();
      }

      tokens.push({ Kind: TokenKind.Heading, Level: level, Text: text } as HeadingToken);
    }

    if (last) {
      (last as ParagraphToken).Text += text;
    } else {
      tokens.push({ Kind: TokenKind.Paragraph, Text: text } as ParagraphToken);
    }

    return true;
  }

  private list(tokens: Tokens, scanner: Scanner) {
    // TODO: Not Implement!
  }

  private listItem(tokens: Tokens, scanner: Scanner) {
    // TODO: Not Implement!
  }

  private eol(scanner: Scanner) {
    if (scanner.Eos()) {
      return true;
    }

    // TODO: Resume that the end of line is '\n'.
    // The end of line can be specified by ParserConfig.
    if (!scanner.Consume(EOL.at(0)!)) {
      return false;
    }

    if (EOL.length > 1) {
      if (!scanner.Consume(EOL.at(1)!)) {
        return false;
      }
    }

    return true;
  }

  private whiteSpace(scanner: Scanner): number {
    let count = 0;
    while (!scanner.Eos()) {
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

  private consume(scanner: Scanner): string | undefined {
    let peek = scanner.Peek();
    if (peek == '\\') {
      scanner.Advance();
      peek += scanner.Peek();
    }
    scanner.Advance();
    return peek;
  }

  private consumeIf(scanner: Scanner, char: string) {
    console.assert(char.length == 1, "The length of expected char is not equal to 1.")
    let buffer = "";
    let peek = scanner.Peek();
    while (peek != char) {
      buffer += peek;
      if (peek == '\\') {
        scanner.Advance();
        buffer += scanner.Peek();
      }
      scanner.Advance();
      peek = scanner.Peek();
    }
    return buffer;
  }

  private consumeUntil(scanner: Scanner, char: string) {
    console.assert(char.length == 1, "The length of expected char is not equal to 1.")
    let buffer = "";
    let peek = scanner.Peek();
    while (peek == char) {
      buffer += peek;
      if (peek == '\\') {
        scanner.Advance();
        buffer += scanner.Peek();
      }
      scanner.Advance();
      peek = scanner.Peek();
    }
  }

  private config: PasrerConfig;
}
