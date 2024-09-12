export enum TokenKind {
  BlankLine,
  Heading,
  Hr,
  BlockQuote,
  IndentedCode,
  FencedCode,
  Def,
  Paragraph,
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

const TAB_SIZE = 4;
const LE = '\n';

export class Scanner {
  constructor(input: string) {
    this.input = input;
  }

  Scan(): Token | undefined {
    if (this.eof()) {
      return undefined;
    }

    let token = undefined;
    let numberOfBlankChar = this.whiteSpace();
    if ((token = this.blankLine()) != undefined) {
      return token;
    } else if (numberOfBlankChar < TAB_SIZE && (token = this.heading()) != undefined) {
      return token;
    } else if (numberOfBlankChar < TAB_SIZE && (token = this.blockQuote()) != undefined) {
      return token;
    } else if (numberOfBlankChar >= TAB_SIZE && (token = this.indentedCode()) != undefined) {
      return token;
    } else if (numberOfBlankChar < TAB_SIZE && (token = this.hr()) != undefined) {
      return token;
    } else if (numberOfBlankChar < TAB_SIZE && (token = this.fencedCode()) != undefined) {
      return token;
    } else if (numberOfBlankChar < TAB_SIZE && (token = this.def()) != undefined) {
      return token;
    }

    return token;
  }

  private blankLine(): BlankLineToken | undefined {
    let s = this.skipLine();
    for (let c of s) {
      if (c != ' ' && c != '\t') {
        this.retreat(s.length);
        return undefined;
      }
    }

    return { Kind: TokenKind.BlankLine };
  }

  private heading(): HeadingToken | undefined {
    let s = this.skipSince('#', 6);
    if (s.length == 0) {
      return undefined;
    }

    if (this.peek() != ' ') {
      return undefined;
    }
    this.advance();

    let level = s.length;
    s = this.skipLine();

    return { Kind: TokenKind.Heading, Text: s, Level: level };
  }

  private hr(): HrToken | undefined {
    let count = 0;
    let line = this.skipLine();
    for (let c of line) {
      if (c == '-' || c == '_' || c == '*') {
        count++;
        continue;
      }

      if (c != '\t' && c != ' ') {
        break;
      }
    }

    if (count < 3) {
      this.retreat(line.length);
      return undefined;
    }
    return { Kind: TokenKind.Hr };
  }

  private blockQuote(): BlockQuoteToken | undefined {
    let s = this.skipSince('>');
    if (s.length == 0) {
      return undefined;
    }

    let buffer = "";
    while (!this.eof()) {
      buffer += this.skipLine();

      this.whiteSpace();
      s = this.skipSince('>');
      if (s.length == 0) {
        break;
      }
    }

    let oldInput = this.input;
    let oldOffset = this.offset;
    this.input = buffer;
    this.offset = 0;

    let tokens: Tokens = [];
    while (!this.eof()) {
      let token = this.Scan();
      if (token == undefined) {
        // TODO: Need a better error handling.
        throw new Error("blockQuote: Syntax Error!");
      }
      tokens.push(token);
    }

    this.input = oldInput;
    this.offset = oldOffset;

    // TODO: Check if next lines is paragraph or not.

    return { Kind: TokenKind.BlockQuote, Tokens: tokens };
  }

  private indentedCode(): IndentedCodeToken | undefined {
    let line = "";
    let numberOfBlankChar = 0;
    while (true) {
      line += this.skipLine();

      numberOfBlankChar = this.whiteSpace();
      if (numberOfBlankChar < TAB_SIZE) {
        break;
      }
      this.retreat(numberOfBlankChar - TAB_SIZE);
    }

    return { Kind: TokenKind.IndentedCode, Code: line };
  }

  private fencedCode(): FencedCodeToen | undefined {
    let bullet = "";
    let begin = this.skipSince('`', this.input.length);
    if (begin.length >= 3) {
      bullet = '`';
    }

    if (bullet == "") {
      begin = this.skipSince('~', this.input.length);
      if (begin.length >= 3) {
        bullet = '~';
      }
    }

    if (bullet == "") {
      return undefined;
    }

    // Recognize the language.
    this.whiteSpace();
    let language = this.skipLine();

    let code = "";
    let end = "";
    while (!this.eof()) {
      code += this.skipLine();

      switch (bullet) {
        case '`':
          end = this.skipSince('`', this.input.length);
          break;
        case '~':
          end = this.skipSince('~', this.input.length);
      }

      if (begin.length <= end.length) {
        break;
      }
    }

    return { Kind: TokenKind.FencedCode, Code: code, Language: language };
  }

  private def(): DefToken | undefined {
    if (this.peek() != '[') {
      return undefined;
    }
    this.advance();

    let text = this.skipUntil(']');
    if (text.length == 0) {
      return undefined;
    }

    let label = text.substring(0, text.length - 1);

    if (this.peek() != ':') {
      return undefined;
    }
    this.advance();

    let url = "";
    let line = this.skipLine();
    let leading = true;
    for (let c of line) {
      if (c == ' ') {
        if (leading) {
          continue;
        }
        break;
      }

      leading = false;
      url += c;
    }

    if (url == "") {
      return undefined;
    }

    let title = "";
    return { Kind: TokenKind.Def, Label: label, Url: url, Title: undefined };
  }

  // Return the number of leading blank character.
  private whiteSpace(): number {
    let count = 0;
    let c = undefined;
    while ((c = this.peek()) != undefined) {
      if (c == undefined) {
        break;
      }

      if (c == ' ') {
        count++;
      } else if (c == '\t') {
        count += 4;
      } else {
        break;
      }
      this.advance();
    }
    return count;
  }

  private skipSince(c: string, repeating: number = 1, escape: boolean = false): string {
    let peek = undefined;
    let count = 0;
    let s = "";
    let inEscape = false;
    while ((peek = this.peek()) != undefined) {
      if (!inEscape && peek == '\\') {
        inEscape = true;
        continue;
      }

      if (inEscape) {
        inEscape = false;
        continue;
      }

      if (inEscape || peek != c || count++ == repeating) {
        break;
      }

      s += peek;
      this.advance();
    }
    return s;
  }

  private skipUntil(c: string, repeating: number = 1): string {
    let peek = undefined;
    let count = 0;
    let s = "";
    let inEscape = false;
    while ((peek = this.peek()) != undefined) {
      s += peek;
      this.advance();

      if (!inEscape && peek == '\\') {
        inEscape = true;
        continue;
      }

      if (inEscape) {
        inEscape = false;
        continue;
      }

      if (peek == c && ++count == repeating) {
        break;
      }
    }
    return s;
  }

  private skipLine(lineEnd: string = LE): string {
    return this.skipUntil(lineEnd);
  }

  private skip(c: string, escape: boolean = false): boolean {
    let peek = this.peek(c.length);
    if (escape && c.length == 1) {
      if (peek == '\\') {
        this.advance();
        peek = this.peek();
        if (peek == c) {
          this.advance();
          return true;
        }
        this.retreat();
        return false;
      }
    }

    if (peek == c) {
      this.advance(c.length);
      return true;
    }
    return false;
  }

  private skipIf(c: string, repeating: number, escape: boolean = false): number {
    let count = 0;
    while (count < repeating) {
      if (!this.skip(c, escape)) {
        break;
      }
      count++;
    }
    return count;
  }

  private skipWhere(c: string, repeating: number, escape: boolean = false): number {
    let count = 0;
    while (count < repeating) {
      if (this.skip(c, escape)) {
        break;
      }
      count++;
    }
    return count;
  }

  private peek(count: number = 1): string | undefined {
    if (this.eof()) {
      return undefined;
    }
    let peek = "";
    for (let i = 0; i < count && this.offset + i < this.input.length; i++) {
      peek += this.input[this.offset + i];
    }
    return peek;
  }

  private advance(count: number = 1) {
    this.offset += count;
  }

  private retreat(count: number = 1) {
    this.offset -= count;
  }

  private eof(): boolean {
    return this.offset >= this.input.length;
  }

  // Return the number of leading blank character.
  private _whiteSpace(): number {
    let count = 0;
    while (!this.eof()) {
      if (this.skip(' ')) {
        count++;
      } else if (this.skip('\t')) {
        count += 4;
      } else {
        break;
      }
    }
    return count;
  }


  // TODO: To be deleted.
  _Scan(): void {
    while (!this.eof()) {
      this.splitBlocks();
      console.log(this.buffer);
    }
  }

  private _blankLine(): boolean {
    let s = this.skipLine();
    for (let c of s) {
      if (c != ' ' && c != '\t') {
        this.retreat(s.length);
        return false;
      }
    }

    return true;
  }

  private fenced(): number {
    let skip = this.skipSince('`', this.input.length);
    if (skip.length >= 3) {
      this.buffer += skip;
      return skip.length;
    }

    skip = this.skipSince(`~`, this.input.length);
    if (skip.length >= 3) {
      this.buffer += skip;
      return skip.length;
    }

    return 0;
  }

  private splitBlocks() {
    let fenced = 0;
    while (!this.eof()) {
      let count = this.fenced();

      if (count != 0) {
        if (fenced == 0) {
          fenced = count;
        } else if (fenced == count) {
          fenced = 0;
        }
      }

      this.buffer += this.skipLine();

      if (fenced == 0 && this._blankLine()) {
        break;
      }
    }

    this.offset = 0;
  }

  private forecast: Token | undefined;
  private buffer: string = "";
  private input: string;
  private offset: number = 0;
}

function scannerHeadingTestcase1() {
  let heading = "# heading";
  let scanner = new Scanner(heading);
  console.info("### == ScannerHeadingTestcase1 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Kind == TokenKind.Heading &&
      (token as HeadingToken).Level == 1 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase1 == ###");
}

function scannerHeadingTestcase2() {
  let input = "## heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase2 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Kind == TokenKind.Heading &&
      (token as HeadingToken).Level == 2 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase2 == ###");
}

function scannerHeadingTestcase3() {
  let input = "### heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase3 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Kind == TokenKind.Heading &&
      (token as HeadingToken).Level == 3 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase3 == ###");
}

function scannerHeadingTestcase4() {
  let input = "#### heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase4 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###")
  } else {
    if ((token as HeadingToken).Kind == TokenKind.Heading &&
      (token as HeadingToken).Level == 4 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase4 == ###");
}

function scannerHeadingTestcase5() {
  let input = "##### heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase5 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Kind == TokenKind.Heading &&
      (token as HeadingToken).Level == 5 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase5 == ###");
}

function scannerHeadingTestcase6() {
  let input = "###### heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase6 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Kind == TokenKind.Heading &&
      (token as HeadingToken).Level == 6 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase6 == ###");
}

function scannerBlockQuoteTestcase1() {
  let input = "> # Heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerBlockQuoteTestcase1 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as BlockQuoteToken).Kind == TokenKind.BlockQuote &&
      (token as BlockQuoteToken).Tokens[0].Kind == TokenKind.Heading) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerBlockQuoteTestcase1 == ###");
}

function scannerBlockQuoteTestcase2() {
  let input = ">>";
  let scanner = new Scanner(input);
  console.info("### == ScannerBlockQuoteTestcase2 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as BlockQuoteToken).Kind == TokenKind.BlockQuote &&
      (token as BlockQuoteToken).Tokens[0].Kind == TokenKind.BlockQuote) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerBlockQuoteTestcase2 == ###");
}

function scannerBlockQuoteTestcase3() {
  let input = ">      code line 1";
  let scanner = new Scanner(input);
  console.info("### == ScannerBlockQuoteTestcase3 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as BlockQuoteToken).Kind == TokenKind.BlockQuote &&
      (token as BlockQuoteToken).Tokens[0].Kind == TokenKind.IndentedCode &&
      (((token as BlockQuoteToken).Tokens[0]) as IndentedCodeToken).Code == "code line 1") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerBlockQuoteTestcase3 == ###");
}

function scannerCommonTestcase1() {
  let input = "";
  let scanner = new Scanner(input);
  console.info("### == ScannerCommonTestcase1 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.log("### TEST PASSED! ###");
  } else {
    console.error("### TEST FAILED! ###");
  }
  console.info("### == ScannerCommonTestcase1 == ###");
}

function scannerBlankLineTestcase1() {
  let input = "     ";
  let scanner = new Scanner(input);
  console.info("### == ScannerBlankLineTestcase1 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as BlockQuoteToken).Kind == TokenKind.BlankLine) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerBlankLineTestcase1 == ###");
}

function scannerIndentedCodeTestcase1() {
  let input = "    indented code";
  let scanner = new Scanner(input);
  console.info("### == ScannerIndentedCodeTestcase1 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as IndentedCodeToken).Kind == TokenKind.IndentedCode) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerIndentedCodeTestcase1 == ###");
}

function scannerIndentedCodeTestcase2() {
  let input = "    code line 1\n    code line 2";
  let scanner = new Scanner(input);
  console.info("### == ScannerIndentedCodeTestcase2 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as IndentedCodeToken).Kind == TokenKind.IndentedCode) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerIndentedCodeTestcase2 == ###");
}

function scannerIndentedCodeTestcase3() {
  let input = "    code line 1\n     code line 2";
  let scanner = new Scanner(input);
  console.info("### == ScannerIndentedCodeTestcase3 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as IndentedCodeToken).Kind == TokenKind.IndentedCode &&
      (token as IndentedCodeToken).Code == "code line 1\n code line 2") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerIndentedCodeTestcase3 == ###");
}

function scannerHrTestcase1() {
  let input = "-- -- --";
  let scanner = new Scanner(input);
  console.info("### == scannerHrTestcase1 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if (token.Kind == TokenKind.Hr) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == scannerHrTestcase1 == ###");
}

function scannerFencedCodeTestcase1() {
  let input = "\`\`\`\nprintf(\"Hello World!\");\n\`\`\`";
  let scanner = new Scanner(input);
  console.info("### == scannerFencedCodeTestcase1 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if (token.Kind == TokenKind.FencedCode &&
      (token as FencedCodeToen).Code == "printf(\"Hello World!\");\n"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == scannerFencedCodeTestcase1 == ###");
}

function scannerFencedCodeTestcase2() {
  let input = "~~~\nprintf(\"Hello World!\");\n~~~~~";
  let scanner = new Scanner(input);
  console.info("### == scannerFencedCodeTestcase2 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if (token.Kind == TokenKind.FencedCode &&
      (token as FencedCodeToen).Code == "printf(\"Hello World!\");\n"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == scannerFencedCodeTestcase2 == ###");
}

function scannerFencedCodeTestcase3() {
  let input = "~~~ c\nprintf(\"Hello World!\");\n~~~~~";
  let scanner = new Scanner(input);
  console.info("### == scannerFencedCodeTestcase3 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if (token.Kind == TokenKind.FencedCode &&
      (token as FencedCodeToen).Code == "printf(\"Hello World!\");\n" &&
      (token as FencedCodeToen).Language == "c\n"
    ) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == scannerFencedCodeTestcase3 == ###");
}

export function ScannerTestcases() {
  // Common
  scannerCommonTestcase1();

  // Heading
  scannerHeadingTestcase1();
  scannerHeadingTestcase2();
  scannerHeadingTestcase3();
  scannerHeadingTestcase4();
  scannerHeadingTestcase5();
  scannerHeadingTestcase6();

  // Block Quote
  scannerBlockQuoteTestcase1();
  scannerBlockQuoteTestcase2();
  scannerBlockQuoteTestcase3();

  // Blank Line
  scannerBlankLineTestcase1();

  // Indented Code
  scannerIndentedCodeTestcase1();
  scannerIndentedCodeTestcase2();
  scannerIndentedCodeTestcase3();

  // Hr
  scannerHrTestcase1();

  // Fenced Code
  scannerFencedCodeTestcase1();
  scannerFencedCodeTestcase2();
  scannerFencedCodeTestcase3();
}


let input = "[abc\\]]: /url";
let scanner = new Scanner(input);
console.log(scanner.Scan());