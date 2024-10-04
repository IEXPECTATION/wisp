import { BlockQuoteToken, DefToken, FencedCodeToen, HeadingToken, IndentedCodeToken, ParagraphToken, Scanner, ScannerTestcases, Token, Element, Tokens } from "./scanner";

export interface PasrerConfig {
  EOL?: string;
  TAB_SIZE?: number;
};

export function MakeDefaultParserConfig() {

}

type Node = Token;
type Nodes = Node[];

export interface Inline extends Node {
  Text: string
}

export interface HeadingNode extends Node {
  Level: number;
  Nodes: Nodes;
}

const TAB_SIZE = 4;
const EOL = '\n';

export class Parser {
  constructor(config: PasrerConfig) {
    this.config = config;
  }

  Parse(input: string) {
    let scanner = new Scanner(input);
    return this.parse(scanner);
  }

  _Parse(input: string) {
    let scanner = new Scanner(input);
    let tokens = this.parse(scanner);
    let nodes = [] as Nodes;
    this.walk(nodes, tokens, () => { });
    return nodes;
  }

  private parse(scanner: Scanner) {
    let tokens: Tokens = [];
    while (!scanner.Eos()) {
      if (this.blankline(tokens, scanner)) {
        continue;
      }

      let whitespace = this.whiteSpace(scanner);
      if (whitespace >= TAB_SIZE) {
        if (this.indentedCode(tokens, scanner)) {
          let el = tokens[tokens.length - 1];
          //  If the number of whitespace is larger than TAB_SIZE, we should add the extra whitespace to Code.
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

      if (this.def(tokens, scanner)) {
        continue;
      }

      if (this.paragraph(tokens, scanner)) {
        continue;
      }
    }
    return tokens;
  }

  private walk(nodes: Nodes, tokens: Tokens, visitor: (nodes: Nodes, token: Token) => void) {
    for (let token of tokens) {
      visitor(nodes, token);
    }
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

    tokens.push({ Kind: Element.BlankLine });
    return true;
  }

  private headingLevel(scanner: Scanner) {
    let count = 0;
    while (count <= 6) {
      if (scanner.Consume('#')) {
        count++;
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

    tokens.push({ Kind: Element.Heading, Text: text, Level: level } as HeadingToken)
    return true;
  }

  private blockQuote(tokens: Tokens, scanner: Scanner) {
    let previous = 0;
    let blockquote: BlockQuoteToken = { Kind: Element.BlockQuote, Tokens: [] };
    let depth = 0;
    let maxDepth = 1;
    let blockquotes = [];
    blockquotes.push(blockquote);

    let mergeBlockQuotes = function (tokens: Tokens) {
      while (maxDepth < depth) {
        // TODO: Insert a new blockquote with tokens inside the current blockquote.
        let newBlockquote: BlockQuoteToken = { Kind: Element.BlockQuote, Tokens: [] };

        blockquotes[maxDepth - 1].Tokens.push(newBlockquote);
        maxDepth += 1;

        blockquotes.push(newBlockquote);
      }

      for (let token of tokens) {
        blockquotes[depth - 1].Tokens.push(token);
      }
    }

    while (scanner.Consume('>')) {
      previous++;
    }

    if (previous == 0) {
      return false;
    }

    while (true) {
      let chunk = "";
      let prefix = 0;
      while (!scanner.Eos()) {
        scanner.Consume(' ');

        while (!this.eol(scanner)) {
          chunk += scanner.Peek();
          scanner.Advance();
        }

        // TODO: Push a eol back to text.
        chunk += EOL;

        while (scanner.Consume('>')) {
          prefix++;
        }

        if (previous != prefix) {
          depth = previous;
          previous = prefix;
          break;
        }
        prefix = 0;
      }

      if (chunk == "") {
        break;
      }

      let subTokens = this.parse(new Scanner(chunk));
      if (subTokens.length == 0) {
        // TODO: Throw an error.
        return false;
      }

      mergeBlockQuotes(subTokens);

      if (subTokens[subTokens.length - 1].Kind == Element.Paragraph) {
        let nextTokens = [] as Tokens;
        // TODO: It may exist a stack overflow in here.
        if (this.paragraph(nextTokens, scanner)) {
          (subTokens[subTokens.length - 1] as ParagraphToken).Text += (nextTokens[0] as ParagraphToken).Text;

          let nextToken = nextTokens[1];
          if (nextToken && nextToken.Kind == Element.BlockQuote) {
            for (let el of (nextToken as BlockQuoteToken).Tokens) {
              blockquote.Tokens.push(el);
            }
          }
          continue;
        }

        break;
      }

      if (prefix == 0) {
        break;
      }
    }

    tokens.push(blockquote);
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

      // TODO: Push a eol back to line.
      if (!scanner.Eos()) {
        line += EOL;
      }

      whitespace = this.whiteSpace(scanner);
      if (whitespace < TAB_SIZE) {
        scanner.Retreat(whitespace);
        break;
      }

      // Add the remaining whitespace if leading whitespace is larger than TAB_SIZE
      line += " ".repeat(whitespace - TAB_SIZE);
    }

    tokens.push({ Kind: Element.IndentedCode, Code: line } as IndentedCodeToken);
    return true;
  }

  private hr(tokens: Tokens, scanner: Scanner) {
    scanner.Anchor();
    let count = 0;
    while (!this.eol(scanner)) {
      if (scanner.Consume('*') ||
        scanner.Consume('-') ||
        scanner.Consume('_')) {
        count++;
        continue;
      }

      if (scanner.Consume(' ') || scanner.Consume('\t')) {
        continue;
      }

      scanner.FlashBack();
      return false;
    }

    if (count >= 3) {
      tokens.push({ Kind: Element.Hr });
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
        startCount++;
      } else {
        eol = false;
        break;
      }
    }

    if (startCount < 3) {
      scanner.FlashBack();
      return false;
    }

    // Recognize the language of fenced code element.
    let language = "";
    if (!eol) {
      this.whiteSpace(scanner);
      while (!this.eol(scanner)) {
        let peek = scanner.Peek();
        if (peek == '\t' || peek == ' ') {
          break;
        }

        language += scanner.Peek();
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
          endCount++;
        }

        if (endCount >= startCount) {
          break;
        }
      }

      code += peek;
      scanner.Advance();
    }

    tokens.push({ Kind: Element.FencedCode, Code: code, Language: language } as FencedCodeToen);
    return false;
  }

  private def(tokens: Tokens, scanner: Scanner) {
    scanner.Anchor();
    if (!scanner.Consume('[')) {
      return false;
    }

    let label = "";
    while (!scanner.Consume(']')) {
      if (scanner.Peek() == '\\') {
        label += scanner.Peek();
        scanner.Advance();
      }

      label += scanner.Peek();
      scanner.Advance();

      if (scanner.Eos()) {
        break;
      }
    }

    if (!scanner.Consume(':')) {
      scanner.FlashBack();
      return false;
    }

    let url = "";
    this.whiteSpace(scanner); // Skip the white spaces.
    // The url may at the same line of label.
    while (!this.eol(scanner)) {
      let peek = scanner.Peek();
      if (peek == ' ' || peek == '\t') {
        break;
      }

      url += scanner.Peek();
      scanner.Advance();
    }

    // If url is not at previous line. it may at current line.
    if (url == "") {
      this.whiteSpace(scanner); // Skip the white spaces.
      while (!this.eol(scanner)) {
        let peek = scanner.Peek();
        if (peek == ' ' || peek == '\t') {
          break;
        }

        url += peek;
        scanner.Advance();
      }

      if (url == "") {
        scanner.FlashBack();
        return false;
      }
    }

    let title = "";
    let inQuote = false;
    this.whiteSpace(scanner); // Skip the white spaces.
    while (!this.eol(scanner)) {
      if (!inQuote && (scanner.Peek() == '\"' || scanner.Peek() == '\'')) {
        inQuote = true;
        scanner.Advance();
        continue;
      }

      if (inQuote && (scanner.Peek() == '\"' || scanner.Peek() == '\'')) {
        inQuote = false;
        break;
      }

      title += scanner.Peek();
      scanner.Advance();
    }

    if (inQuote) {
      title += EOL;
      while (scanner.Peek() != '\"' && scanner.Peek() != '\'') {
        if (scanner.Peek() == '\\') {
          label += scanner.Peek();
          scanner.Advance();
        }

        title += scanner.Peek();
        scanner.Advance();

        if (scanner.Eos()) {
          break;
        }
      }
    } else {
      if (title == "") {
        // Search in next line.
        this.whiteSpace(scanner);
        while (!this.eol(scanner)) {
          if (scanner.Peek() == '\"' || scanner.Peek() == '\'') {
            inQuote = true;
          }
        }

        if (inQuote) {
          title += EOL;
          while (scanner.Peek() != '\"' && scanner.Peek() != '\'') {
            if (scanner.Peek() == '\\') {
              label += scanner.Peek();
              scanner.Advance();
            }

            title += scanner.Peek();
            scanner.Advance();

            if (scanner.Eos()) {
              break;
            }
          }
        }
      }
    }

    tokens.push({ Kind: Element.Def, Label: label, Url: url, Title: title } as DefToken);
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
      count++;
    }

    if (count >= 3) {
      return bullet == '=' ? 1 : 2;
    }
    return 0;
  }

  private paragraph(tokens: Tokens, scanner: Scanner) {
    let nextTokens = [] as Tokens;
    let text = "";
    while (!scanner.Eos()) {
      while (!this.eol(scanner)) {
        text += scanner.Peek();
        scanner.Advance();
      }

      // TODO: Push a eol back to text.
      text += EOL;

      // Check if the next line is still a paragraph.
      if (this.blankline(nextTokens, scanner)) {
        break;
      }

      if (this.heading(nextTokens, scanner)) {
        break;
      }

      if (this.blockQuote(nextTokens, scanner)) {
        break;
      }

      if (this.fencedCode(nextTokens, scanner)) {
        break;
      }

      if (this.def(nextTokens, scanner)) {
        break;
      }

      let whitespace = this.whiteSpace(scanner);
      if (whitespace >= TAB_SIZE) {
        scanner.Retreat(whitespace);
        break;
      }

      let level = this.setextHeading(scanner);
      if (level != 0) {
        tokens.push({ Kind: Element.Heading, Text: text, Level: level } as HeadingToken);
        return true;
      }
    }

    if (text == "") {
      return false;
    }

    tokens.push({ Kind: Element.Paragraph, Text: text } as ParagraphToken);
    if (nextTokens.length != 0) {
      tokens.push(nextTokens[0]);
    }

    return true;
  }

  private list(tokens: Tokens, scanner: Scanner) {
    // TODO: Not Implement!
  }

  private listItem(tokens: Tokens, scanner: Scanner) {
    // TODO: Not Implement!
  }

  private terminate(element: Element, scanner: number) {

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
        count++;
      } else if (scanner.Consume('\t')) {
        count += 4;
      } else {
        break;
      }
    }

    return count;
  }


  private config: PasrerConfig;
}

// Blank Line
function parserBlankLineTestcase1() {
  let input = "     ";
  let parser = new Parser({});
  console.info("< parserBlankLineTestcase1 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.BlankLine) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< parserBlankLineTestcase1 >");
}

// Heading
function parserHeadingTestcase1() {
  let input = "# heading\n   \tasd\n\t   a";
  let parser = new Parser({});
  console.info("< ParserHeadingTestcase1 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as HeadingToken).Kind == Element.Heading &&
      (tokens[0] as HeadingToken).Level == 1 &&
      (tokens[0] as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserHeadingTestcase1 >");
}

function parserHeadingTestcase2() {
  let input = "## heading";
  let parser = new Parser({});
  console.info("< ParserHeadingTestcase2 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as HeadingToken).Kind == Element.Heading &&
      (tokens[0] as HeadingToken).Level == 2 &&
      (tokens[0] as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserHeadingTestcase2 >");
}

function parserHeadingTestcase3() {
  let input = "### heading";
  let parser = new Parser({});
  console.info("< ParserHeadingTestcase3 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as HeadingToken).Kind == Element.Heading &&
      (tokens[0] as HeadingToken).Level == 3 &&
      (tokens[0] as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserHeadingTestcase3 >");
}

function parserHeadingTestcase4() {
  let input = "#### heading";
  let parser = new Parser({});
  console.info("< ParserHeadingTestcase4 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###")
  } else {
    if ((tokens[0] as HeadingToken).Kind == Element.Heading &&
      (tokens[0] as HeadingToken).Level == 4 &&
      (tokens[0] as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserHeadingTestcase4 >");
}

function parserHeadingTestcase5() {
  let input = "##### heading";
  let parser = new Parser({});
  console.info("< ParserHeadingTestcase5 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as HeadingToken).Kind == Element.Heading &&
      (tokens[0] as HeadingToken).Level == 5 &&
      (tokens[0] as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserHeadingTestcase5 >");
}

function parserHeadingTestcase6() {
  let input = "###### heading";
  let parser = new Parser({});
  console.info("< ParserHeadingTestcase6 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as HeadingToken).Kind == Element.Heading &&
      (tokens[0] as HeadingToken).Level == 6 &&
      (tokens[0] as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserHeadingTestcase6 >");
}

// Block Quote
function parserBlockQuoteTestcase1() {
  let input = "> # Heading";
  let parser = new Parser({});
  console.info("< ParserBlockQuoteTestcase1 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as BlockQuoteToken).Kind == Element.BlockQuote &&
      (tokens[0] as BlockQuoteToken).Tokens[0].Kind == Element.Heading) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserBlockQuoteTestcase1 >");
}

function parserBlockQuoteTestcase2() {
  let input = ">>";
  let parser = new Parser({});
  console.info("< ParserBlockQuoteTestcase2 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as BlockQuoteToken).Kind == Element.BlockQuote &&
      (tokens[0] as BlockQuoteToken).Tokens[0].Kind == Element.BlockQuote) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserBlockQuoteTestcase2 >");
}

function parserBlockQuoteTestcase3() {
  let input = ">     code line 1";
  let parser = new Parser({});
  console.info("< ParserBlockQuoteTestcase3 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as BlockQuoteToken).Kind == Element.BlockQuote &&
      (tokens[0] as BlockQuoteToken).Tokens[0].Kind == Element.IndentedCode &&
      (((tokens[0] as BlockQuoteToken).Tokens[0]) as IndentedCodeToken).Code == "code line 1") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserBlockQuoteTestcase3 >");
}

// Indented Code
function parserIndentedCodeTestcase1() {
  let input = "    indented code";
  let parser = new Parser({});
  console.info("< ParserIndentedCodeTestcase1 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as IndentedCodeToken).Kind == Element.IndentedCode) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserIndentedCodeTestcase1 >");
}

function parserIndentedCodeTestcase2() {
  let input = "    code line 1\n    code line 2";
  let parser = new Parser({});
  console.info("< ParserIndentedCodeTestcase2 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as IndentedCodeToken).Kind == Element.IndentedCode) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserIndentedCodeTestcase2 >");
}

function parserIndentedCodeTestcase3() {
  let input = "    code line 1\n    code line 2";
  let parser = new Parser({});
  console.info("< ParserIndentedCodeTestcase3 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if ((tokens[0] as IndentedCodeToken).Kind == Element.IndentedCode &&
      (tokens[0] as IndentedCodeToken).Code == "code line 1\ncode line 2") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserIndentedCodeTestcase3 >");
}

// Hr
function ParserHrTestcase1() {
  let input = "-- -- --";
  let parser = new Parser({});
  console.info("< ParserHrTestcase1 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.Hr) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserHrTestcase1 >");
}

// Fenced Code
function parserFencedCodeTestcase1() {
  let input = "\`\`\`\nprintf(\"Hello World!\");\n\`\`\`";
  let parser = new Parser({});
  console.info("< ParserFencedCodeTestcase1 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.FencedCode &&
      (tokens[0] as FencedCodeToen).Code == "printf(\"Hello World!\");\n"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserFencedCodeTestcase1 >");
}

function parserFencedCodeTestcase2() {
  let input = "~~~\nprintf(\"Hello World!\");\n~~~~~";
  let parser = new Parser({});
  console.info("< ParserFencedCodeTestcase2 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.FencedCode &&
      (tokens[0] as FencedCodeToen).Code == "printf(\"Hello World!\");\n"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserFencedCodeTestcase2 >");
}

function parserFencedCodeTestcase3() {
  let input = "~~~ c\nprintf(\"Hello World!\");\n~~~~~";
  let parser = new Parser({});
  console.info("< ParserFencedCodeTestcase3 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.FencedCode &&
      (tokens[0] as FencedCodeToen).Code == "printf(\"Hello World!\");\n" &&
      (tokens[0] as FencedCodeToen).Language == "c"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserFencedCodeTestcase3 >");
}

// Def
function parserDefTestcase1() {
  let input = "[foo]: /url \"title\"";
  let parser = new Parser({});
  console.info("< ParserDefTestcase1 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.Def &&
      (tokens[0] as DefToken).Label == "foo" &&
      (tokens[0] as DefToken).Url == "/url" &&
      (tokens[0] as DefToken).Title == "title"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserDefTestcase1 >");
}

function parserDefTestcase2() {
  let input = "[foo]:\n/url";
  let parser = new Parser({});
  console.info("< ParserDefTestcase2 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.Def &&
      (tokens[0] as DefToken).Label == "foo" &&
      (tokens[0] as DefToken).Url == "/url" &&
      (tokens[0] as DefToken).Title == ""
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserDefTestcase2 >");
}

function parserDefTestcase3() {
  let input = "[foo]: /url \'\ntitle\nline1\nline2\n\'";
  let parser = new Parser({});
  console.info("< ParserDefTestcase3 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.Def &&
      (tokens[0] as DefToken).Label == "foo" &&
      (tokens[0] as DefToken).Url == "/url" &&
      (tokens[0] as DefToken).Title == "\ntitle\nline1\nline2\n"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< ParserDefTestcase3 >");
}

function ParserParagrahTestcase1() {
  let input = "Heading1\n=====";
  let parser = new Parser({});
  console.info("< scannerParagrahTestcase1 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.Heading &&
      (tokens[0] as HeadingToken).Level == 1 &&
      (tokens[0] as HeadingToken).Text == "Heading1\n"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< scannerParagrahTestcase1 >");
}


function ParserParagrahTestcase2() {
  let input = "Heading2\n-------";
  let parser = new Parser({});
  console.info("< scannerParagrahTestcase2 >");
  let tokens = parser.Parse(input);
  if (tokens.length == 0) {
    console.error("### TEST FAILED! ###");
    console.dir(tokens, { depth: Infinity });
  } else {
    if (tokens[0].Kind == Element.Heading &&
      (tokens[0] as HeadingToken).Level == 2 &&
      (tokens[0] as HeadingToken).Text == "Heading2\n"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
      console.dir(tokens, { depth: Infinity });
    }
  }
  console.info("< scannerParagrahTestcase2 >");
}

function ParserCommonTestcase1() {
  let input =
    `# Intro

Hi everyone, Today I'm excited to announce a great progress of my first static site generator (SSG) project. That is the markdown parser is completed.

Markdown is a esay, simple markup languange which is suitable for writing some articles. And it can be esay to transform to html. So a markodnw parser is a basic component of a SSG.

The markdown parser of *wisp*.


> here is a simple test.
>>> here is an another test.
asdasdasd
>>> # Heading
>> # Heading1
asdasdasd
`;

  let parser = new Parser({});
  let tokens = parser.Parse(input);

  console.dir(tokens, { depth: Infinity });
}

export function ParserTestcases() {
  // Heading
  parserHeadingTestcase1();
  parserHeadingTestcase2();
  parserHeadingTestcase3();
  parserHeadingTestcase4();
  parserHeadingTestcase5();
  parserHeadingTestcase6();

  // Block Quote
  parserBlockQuoteTestcase1();
  parserBlockQuoteTestcase2();
  parserBlockQuoteTestcase3();

  // Blank Line
  parserBlankLineTestcase1();

  // Indented Code
  parserIndentedCodeTestcase1();
  parserIndentedCodeTestcase2();
  parserIndentedCodeTestcase3();

  // Hr
  ParserHrTestcase1();

  // Fenced Code
  parserFencedCodeTestcase1();
  parserFencedCodeTestcase2();
  parserFencedCodeTestcase3();

  // Def
  parserDefTestcase1();
  parserDefTestcase2();
  parserDefTestcase3();

  // Paragraph
  ParserParagrahTestcase1();
  ParserParagrahTestcase2();

  // Common test
  ParserCommonTestcase1();
}


let input = `
> line 1
line 1 continuation text
> line 2
line 2 continuation text
> line 3
line 3 continuation text
> line 4
line 4 continuation text
> line 5
line 5 continuation text
> line 6
line 6 continuation text
> line 7
line 7 continuation text
> line 8
line 8 continuation text
> line 9
line 9 continuation text
> line 10
line 10 continuation text
> line 11
line 11 continuation text
> line 12
line 12 continuation text
> line 13
line 13 continuation text
> line 13
line 13 continuation text
> line 14
line 14 continuation text
> line 14
line 14 continuation text
> line 15
line 15 continuation text
> line 16
line 16 continuation text
> line 17
line 17 continuation text
> line 18
line 18 continuation text
> line 19
line 19 continuation text
> line 20
line 20 continuation text
> line 21
line 21 continuation text
> line 22
line 22 continuation text
> line 23
line 23 continuation text
> line 24
line 24 continuation text
> line 25
line 25 continuation text
`;
let parser = new Parser({});
let tokens = parser.Parse(input);
console.dir(tokens, { depth: Infinity });
