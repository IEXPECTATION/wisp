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

export interface ParagraphToken extends Token {
  Text: string;
}

export class ScannerConfig {

}

export class Scanner {
  constructor(input: string) {
    this.input = input;
  }

  Eof() {
    return this.offset == this.input.length;
  }

  Peek() {
    if (this.Eof()) {
      return undefined;
    }

    return this.input[this.offset];
  }

  Next(count: number = 1) {
    if (this.Eof()) {
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

  BlankLine(): boolean {
    return false;
  }

  WhiteSpace(): number {
    return 0;
  }



  // // TODO: To be deleted.

  // Scan(): Token | undefined {
  //   if (this.eof()) {
  //     return undefined;
  //   }

  //   let token = undefined;
  //   let numberOfBlankChar = this.whiteSpace();

  //   if ((token = this.blankLine()) != undefined) {
  //     return token;
  //   }

  //   if (numberOfBlankChar < TAB_SIZE && (token = this.heading()) != undefined) {
  //     return token;
  //   }

  //   if (numberOfBlankChar < TAB_SIZE && (token = this.blockQuote()) != undefined) {
  //     return token;
  //   }

  //   if (numberOfBlankChar >= TAB_SIZE && (token = this.indentedCode()) != undefined) {
  //     return token;
  //   }

  //   if (numberOfBlankChar < TAB_SIZE && (token = this.hr()) != undefined) {
  //     return token;
  //   }

  //   if (numberOfBlankChar < TAB_SIZE && (token = this.fencedCode()) != undefined) {
  //     return token;
  //   }

  //   if (numberOfBlankChar < TAB_SIZE && (token = this.def()) != undefined) {
  //     return token;
  //   }

  //   if (numberOfBlankChar < TAB_SIZE && (token = this.paragraph()) != undefined) {
  //     return token;
  //   }

  //   return token;
  // }

  // Reset(input: string) {
  //   this.input = input;
  //   this.offset = 0;
  // }

  // private isBlankLine(input: string): boolean {
  //   for (let c of input) {
  //     if (c != ' ' && c != '\t') {
  //       this.retreat(input.length);
  //       return false;
  //     }
  //   }

  //   return true;
  // }

  // private blankLine(): BlankLineToken | undefined {
  //   let line = this.skipLine();
  //   if (this.isBlankLine(line)) {
  //     return { Kind: TokenKind.BlankLine };
  //   }
  //   return undefined;
  // }

  // private heading(): HeadingToken | undefined {
  //   let level = this.skipIf('#', 6);
  //   if (level == 0) {
  //     return undefined;
  //   }

  //   if (this.peek() != ' ') {
  //     return undefined;
  //   }
  //   this.advance();

  //   let text = this.skipLine();

  //   return { Kind: TokenKind.Heading, Text: text, Level: level };
  // }

  // private hr(): HrToken | undefined {
  //   let count = 0;
  //   let line = this.skipLine();
  //   for (let c of line) {
  //     if (c == '-' || c == '_' || c == '*') {
  //       count++;
  //       continue;
  //     }

  //     if (c != '\t' && c != ' ') {
  //       break;
  //     }
  //   }

  //   if (count < 3) {
  //     this.retreat(line.length);
  //     return undefined;
  //   }
  //   return { Kind: TokenKind.Hr };
  // }

  // private blockQuote(): BlockQuoteToken | undefined {
  //   let count = this.skipIf('>');
  //   if (count == 0) {
  //     return undefined;
  //   }

  //   let buffer = "";
  //   while (!this.eof()) {
  //     buffer += this.skipLine();

  //     count = this.whiteSpace();
  //     if (count >= TAB_SIZE) {
  //       this.retreat(count);
  //       break;
  //     }

  //     count = this.skipIf('>');
  //     if (count == 0) {
  //       break;
  //     }
  //   }

  //   let oldInput = this.input;
  //   let oldOffset = this.offset;
  //   this.input = buffer;
  //   this.offset = 0;

  //   let tokens: Tokens = [];
  //   while (!this.eof()) {
  //     let token = this.Scan();
  //     if (token == undefined) {
  //       // TODO: Need a better error handling.
  //       throw new Error("blockQuote: Syntax Error!");
  //     }
  //     tokens.push(token);
  //   }

  //   this.input = oldInput;
  //   this.offset = oldOffset;

  //   // TODO: Check if next lines is paragraph or not.

  //   return { Kind: TokenKind.BlockQuote, Tokens: tokens };
  // }

  // private indentedCode(): IndentedCodeToken | undefined {
  //   let line = "";
  //   let numberOfBlankChar = 0;
  //   while (true) {
  //     line += this.skipLine();

  //     numberOfBlankChar = this.whiteSpace();
  //     if (numberOfBlankChar < TAB_SIZE) {
  //       break;
  //     }
  //     this.retreat(numberOfBlankChar - TAB_SIZE);
  //   }

  //   return { Kind: TokenKind.IndentedCode, Code: line };
  // }

  // private fencedCode(): FencedCodeToen | undefined {
  //   let bullet = "";
  //   let begin = this.skipSince('`', this.input.length);
  //   if (begin.length >= 3) {
  //     bullet = '`';
  //   }

  //   if (bullet == "") {
  //     begin = this.skipSince('~', this.input.length);
  //     if (begin.length >= 3) {
  //       bullet = '~';
  //     }
  //   }

  //   if (bullet == "") {
  //     return undefined;
  //   }

  //   // Recognize the language.
  //   this.whiteSpace();
  //   let language = this.skipLine();

  //   let code = "";
  //   let end = "";
  //   while (!this.eof()) {
  //     code += this.skipLine();

  //     switch (bullet) {
  //       case '`':
  //         end = this.skipSince('`', this.input.length);
  //         break;
  //       case '~':
  //         end = this.skipSince('~', this.input.length);
  //     }

  //     if (begin.length <= end.length) {
  //       break;
  //     }
  //   }

  //   return { Kind: TokenKind.FencedCode, Code: code, Language: language };
  // }

  // private def(): DefToken | undefined {
  //   if (this.peek() != '[') {
  //     return undefined;
  //   }
  //   this.advance();

  //   let text = this.skipUntil(']');
  //   if (text.length == 0) {
  //     return undefined;
  //   }

  //   let label = text.substring(0, text.length - 1);

  //   if (this.peek() != ':') {
  //     return undefined;
  //   }
  //   this.advance();

  //   let definition = this.definition();
  //   if (definition == undefined) {
  //     return undefined;
  //   }

  //   return { Kind: TokenKind.Def, Label: label, Url: definition.Url, Title: definition.Title };
  // }

  // private definition(): { Url: string, Title: string } | undefined {
  //   let url = "";
  //   let title = "";
  //   let count = 0;
  //   let line = "";
  //   while (count < 2) {
  //     line = this.skipLine();
  //     let isBlankLine = true;
  //     for (let c of line) {
  //       if (c != ' ' && c != '\t' && c != '\r' && c != '\n') {
  //         isBlankLine = false;
  //         break;
  //       }
  //     }

  //     if (isBlankLine) {
  //       count++;
  //       continue;
  //     }
  //     break;
  //   }

  //   if (count == 2) {
  //     this.retreat(line.length);
  //     return undefined;
  //   }

  //   // TODO: Recognize the format of angle bracket url.
  //   let index = 0;
  //   while (index < line.length) {
  //     if (line[index] == ' ' || line[index] == '\t') {
  //       index++;
  //       continue;
  //     } else if (line[index] == "\"" || line[index] == "\'") {
  //       break;
  //     }

  //     url += line[index];
  //     index++;
  //   }

  //   if (url == "") {
  //     this.retreat(line.length);
  //     return undefined;
  //   }

  //   // Continue to read remaining characters to check whether a title is existed.
  //   let inQuote = false;
  //   let quote = "";
  //   while (index < line.length) {
  //     if (line[index] == ' ' || line[index] == '\t') {
  //       index++;
  //       continue;
  //     }

  //     if ((line[index] == '\"' || line[index] == '\'')) {
  //       if (inQuote && line[index] == quote) {
  //         inQuote = false;
  //         break;
  //       } else {
  //         quote = line[index];
  //         inQuote = true;
  //         index++;
  //         continue;
  //       }
  //     }

  //     if (inQuote) {
  //       title += line[index];
  //     }
  //     index++;
  //   }

  //   // Try to read the next line, and check whether there is a title.
  //   if (!inQuote && title == "") {
  //     line = this.skipLine();
  //     let inQuote = false;
  //     for (let c of line) {
  //       if ((c == '\"' || c == '\'')) {
  //         if (inQuote) {
  //           break;
  //         } else {
  //           quote = line[index];
  //           inQuote = true;
  //           index++;
  //           continue;
  //         }
  //       }

  //       if (inQuote) {
  //         title += c;
  //       }
  //     }
  //   }

  //   // If inQuote is true, the title has multiple lines.
  //   while (inQuote && !this.eof()) {
  //     line = this.skipLine();
  //     for (let c of line) {
  //       if (c == quote) {
  //         inQuote = false;
  //         break;
  //       }

  //       title += c;
  //     }
  //   }

  //   return { Url: url, Title: title };
  // }

  // private paragraph(): HeadingToken | ParagraphToken | undefined {
  //   let text = "";
  //   while (!this.eof()) {
  //     let line = this.skipLine();
  //     text += line;

  //     let count = this.whiteSpace();
  //     if (count >= TAB_SIZE) {
  //       this.retreat(count);
  //       break;
  //     }

  //     line = this.skipLine();
  //     let level = this.isSetextHeading(line);
  //     if (level != 0) {
  //       return { Kind: TokenKind.Heading, Text: text, Level: level };
  //     }

  //     if (this.isBlankLine(line)) {
  //       this.retreat(line.length);
  //       break;
  //     }
  //   }

  //   return { Kind: TokenKind.Paragraph, Text: text };
  // }

  // private isSetextHeading(input: string): number {
  //   let bullet = input[0];
  //   if (bullet != '=' && bullet != '-') {
  //     return 0;
  //   }

  //   let count = 1;
  //   let skip = 0;
  //   while (++skip < input.length) {
  //     if (input[skip] == '\n') {
  //       break;
  //     } else if (input[skip] != bullet) {
  //       return 0;
  //     }
  //     count++;
  //   }

  //   if (skip < input.length) {
  //     skip++;
  //   }

  //   if (count < 3) {
  //     return 0;
  //   }

  //   return bullet == '=' ? 1 : 2;
  // }

  // // Return the number of leading white space characters.
  // private whiteSpace(): number {
  //   let count = 0;
  //   while (!this.eof()) {
  //     if (this.skip(' ')) {
  //       count++;
  //     } else if (this.skip('\t')) {
  //       count += 4;
  //     } else {
  //       break;
  //     }
  //   }
  //   return count;
  // }

  // private skipSince(c: string, repeating: number = 1): string {
  //   let peek = undefined;
  //   let count = 0;
  //   let s = "";
  //   let inEscape = false;
  //   while ((peek = this.peek()) != undefined) {
  //     if (!inEscape && peek == '\\') {
  //       inEscape = true;
  //       continue;
  //     }

  //     if (inEscape) {
  //       inEscape = false;
  //       continue;
  //     }

  //     if (inEscape || peek != c || count++ == repeating) {
  //       break;
  //     }

  //     s += peek;
  //     this.advance();
  //   }
  //   return s;
  // }

  // private skipUntil(c: string, repeating: number = 1): string {
  //   let peek = undefined;
  //   let count = 0;
  //   let s = "";
  //   let inEscape = false;
  //   while ((peek = this.peek()) != undefined) {
  //     s += peek;
  //     this.advance();

  //     if (!inEscape && peek == '\\') {
  //       inEscape = true;
  //       continue;
  //     }

  //     if (inEscape) {
  //       inEscape = false;
  //       continue;
  //     }

  //     if (peek == c && ++count == repeating) {
  //       break;
  //     }
  //   }
  //   return s;
  // }

  // private skipLine(lineEnd: string = LE): string {
  //   return this.skipUntil(lineEnd);
  // }

  // private skip(c: string, escape: boolean = false): boolean {
  //   let peek = this.peek(c.length);
  //   if (escape && c.length == 1) {
  //     if (peek == '\\') {
  //       this.advance();
  //       peek = this.peek();
  //       if (peek == c) {
  //         this.advance();
  //         return true;
  //       }
  //       this.retreat();
  //       return false;
  //     }
  //   }

  //   if (peek == c) {
  //     this.advance(c.length);
  //     return true;
  //   }
  //   return false;
  // }

  // private skipIf(c: string, repeating: number = 1, escape: boolean = false): number {
  //   let count = 0;
  //   while (count < repeating) {
  //     if (!this.skip(c, escape)) {
  //       break;
  //     }
  //     count++;
  //   }
  //   return count;
  // }

  // private skipWhere(c: string, repeating: number = 1, escape: boolean = false): number {
  //   let count = 0;
  //   while (count < repeating) {
  //     if (this.skip(c, escape)) {
  //       break;
  //     }
  //     count++;
  //   }
  //   return count;
  // }

  // private next(input: string, offset: number = 0, count: number = 1) {
  //   return input.substring(offset, offset + count);
  // }

  // private peek(count: number = 1): string | undefined {
  //   if (this.eof()) {
  //     return undefined;
  //   }
  //   return this.next(this.input, this.offset, count);
  // }

  // private advance(count: number = 1) {
  //   this.offset += count;
  // }

  // private retreat(count: number = 1) {
  //   this.offset -= count;
  // }


  // private eof(): boolean {
  //   return this.offset >= this.input.length;
  // }

  private input: string;
  private offset: number = 0;
}

// function scannerCommonTestcase1() {
//   let input = "";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerCommonTestcase1 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.log("### TEST PASSED! ###");
//   } else {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   }
//   console.info("### == ScannerCommonTestcase1 == ###");
// }

// // Heading
// function scannerHeadingTestcase1() {
//   let heading = "# heading";
//   let scanner = new Scanner(heading);
//   console.info("### == ScannerHeadingTestcase1 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as HeadingToken).Kind == TokenKind.Heading &&
//       (token as HeadingToken).Level == 1 &&
//       (token as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerHeadingTestcase1 == ###");
// }

// function scannerHeadingTestcase2() {
//   let input = "## heading";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerHeadingTestcase2 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as HeadingToken).Kind == TokenKind.Heading &&
//       (token as HeadingToken).Level == 2 &&
//       (token as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerHeadingTestcase2 == ###");
// }

// function scannerHeadingTestcase3() {
//   let input = "### heading";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerHeadingTestcase3 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as HeadingToken).Kind == TokenKind.Heading &&
//       (token as HeadingToken).Level == 3 &&
//       (token as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerHeadingTestcase3 == ###");
// }

// function scannerHeadingTestcase4() {
//   let input = "#### heading";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerHeadingTestcase4 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###")
//   } else {
//     if ((token as HeadingToken).Kind == TokenKind.Heading &&
//       (token as HeadingToken).Level == 4 &&
//       (token as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerHeadingTestcase4 == ###");
// }

// function scannerHeadingTestcase5() {
//   let input = "##### heading";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerHeadingTestcase5 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as HeadingToken).Kind == TokenKind.Heading &&
//       (token as HeadingToken).Level == 5 &&
//       (token as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerHeadingTestcase5 == ###");
// }

// function scannerHeadingTestcase6() {
//   let input = "###### heading";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerHeadingTestcase6 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as HeadingToken).Kind == TokenKind.Heading &&
//       (token as HeadingToken).Level == 6 &&
//       (token as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerHeadingTestcase6 == ###");
// }

// // Block Quote
// function scannerBlockQuoteTestcase1() {
//   let input = "> # Heading";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerBlockQuoteTestcase1 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as BlockQuoteToken).Kind == TokenKind.BlockQuote &&
//       (token as BlockQuoteToken).Tokens[0].Kind == TokenKind.Heading) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerBlockQuoteTestcase1 == ###");
// }

// function scannerBlockQuoteTestcase2() {
//   let input = ">>";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerBlockQuoteTestcase2 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as BlockQuoteToken).Kind == TokenKind.BlockQuote &&
//       (token as BlockQuoteToken).Tokens[0].Kind == TokenKind.BlockQuote) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerBlockQuoteTestcase2 == ###");
// }

// function scannerBlockQuoteTestcase3() {
//   let input = ">      code line 1";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerBlockQuoteTestcase3 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as BlockQuoteToken).Kind == TokenKind.BlockQuote &&
//       (token as BlockQuoteToken).Tokens[0].Kind == TokenKind.IndentedCode &&
//       (((token as BlockQuoteToken).Tokens[0]) as IndentedCodeToken).Code == "code line 1") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerBlockQuoteTestcase3 == ###");
// }

// // Blank Line
// function scannerBlankLineTestcase1() {
//   let input = "     ";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerBlankLineTestcase1 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as BlockQuoteToken).Kind == TokenKind.BlankLine) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerBlankLineTestcase1 == ###");
// }

// // Indented Code
// function scannerIndentedCodeTestcase1() {
//   let input = "    indented code";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerIndentedCodeTestcase1 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as IndentedCodeToken).Kind == TokenKind.IndentedCode) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerIndentedCodeTestcase1 == ###");
// }

// function scannerIndentedCodeTestcase2() {
//   let input = "    code line 1\n    code line 2";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerIndentedCodeTestcase2 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as IndentedCodeToken).Kind == TokenKind.IndentedCode) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerIndentedCodeTestcase2 == ###");
// }

// function scannerIndentedCodeTestcase3() {
//   let input = "    code line 1\n     code line 2";
//   let scanner = new Scanner(input);
//   console.info("### == ScannerIndentedCodeTestcase3 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if ((token as IndentedCodeToken).Kind == TokenKind.IndentedCode &&
//       (token as IndentedCodeToken).Code == "code line 1\n code line 2") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == ScannerIndentedCodeTestcase3 == ###");
// }

// // Hr
// function scannerHrTestcase1() {
//   let input = "-- -- --";
//   let scanner = new Scanner(input);
//   console.info("### == scannerHrTestcase1 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if (token.Kind == TokenKind.Hr) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == scannerHrTestcase1 == ###");
// }

// // Fenced Code
// function scannerFencedCodeTestcase1() {
//   let input = "\`\`\`\nprintf(\"Hello World!\");\n\`\`\`";
//   let scanner = new Scanner(input);
//   console.info("### == scannerFencedCodeTestcase1 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if (token.Kind == TokenKind.FencedCode &&
//       (token as FencedCodeToen).Code == "printf(\"Hello World!\");\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == scannerFencedCodeTestcase1 == ###");
// }

// function scannerFencedCodeTestcase2() {
//   let input = "~~~\nprintf(\"Hello World!\");\n~~~~~";
//   let scanner = new Scanner(input);
//   console.info("### == scannerFencedCodeTestcase2 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if (token.Kind == TokenKind.FencedCode &&
//       (token as FencedCodeToen).Code == "printf(\"Hello World!\");\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == scannerFencedCodeTestcase2 == ###");
// }

// function scannerFencedCodeTestcase3() {
//   let input = "~~~ c\nprintf(\"Hello World!\");\n~~~~~";
//   let scanner = new Scanner(input);
//   console.info("### == scannerFencedCodeTestcase3 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if (token.Kind == TokenKind.FencedCode &&
//       (token as FencedCodeToen).Code == "printf(\"Hello World!\");\n" &&
//       (token as FencedCodeToen).Language == "c\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == scannerFencedCodeTestcase3 == ###");
// }

// // Def
// function scannerDefTestcase1() {
//   let input = "[foo]: /url \"title\"";
//   let scanner = new Scanner(input);
//   console.info("### == scannerDefTestcase1 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if (token.Kind == TokenKind.Def &&
//       (token as DefToken).Label == "foo" &&
//       (token as DefToken).Url == "/url" &&
//       (token as DefToken).Title == "title"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == scannerDefTestcase1 == ###");
// }

// function scannerDefTestcase2() {
//   let input = "[foo]:\n/url";
//   let scanner = new Scanner(input);
//   console.info("### == scannerDefTestcase2 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if (token.Kind == TokenKind.Def &&
//       (token as DefToken).Label == "foo" &&
//       (token as DefToken).Url == "/url" &&
//       (token as DefToken).Title == ""
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == scannerDefTestcase2 == ###");
// }

// function scannerDefTestcase3() {
//   let input = "[foo]: /url \'\ntitle\nline1\nline2\n\'";
//   let scanner = new Scanner(input);
//   console.info("### == scannerDefTestcase3 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if (token.Kind == TokenKind.Def &&
//       (token as DefToken).Label == "foo" &&
//       (token as DefToken).Url == "/url" &&
//       (token as DefToken).Title == "\ntitle\nline1\nline2\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == scannerDefTestcase3 == ###");
// }

// function scannerParagrahTestcase1() {
//   let input = "Heading1\n=====";
//   let scanner = new Scanner(input);
//   console.info("### == scannerParagrahTestcase1 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if (token.Kind == TokenKind.Heading &&
//       (token as HeadingToken).Level == 1 &&
//       (token as HeadingToken).Text == "Heading1\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == scannerParagrahTestcase1 == ###");
// }

// function scannerParagrahTestcase2() {
//   let input = "Heading2\n-------";
//   let scanner = new Scanner(input);
//   console.info("### == scannerParagrahTestcase2 == ###");
//   let token = scanner.Scan();
//   if (token == undefined) {
//     console.error("### TEST FAILED! ###");
//     console.dir(token, { depth: Infinity });
//   } else {
//     if (token.Kind == TokenKind.Heading &&
//       (token as HeadingToken).Level == 2 &&
//       (token as HeadingToken).Text == "Heading2\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(token, { depth: Infinity });
//     }
//   }
//   console.info("### == scannerParagrahTestcase2 == ###");
// }


export function ScannerTestcases() {
  // // Common
  // scannerCommonTestcase1();

  // // Heading
  // scannerHeadingTestcase1();
  // scannerHeadingTestcase2();
  // scannerHeadingTestcase3();
  // scannerHeadingTestcase4();
  // scannerHeadingTestcase5();
  // scannerHeadingTestcase6();

  // // Block Quote
  // scannerBlockQuoteTestcase1();
  // scannerBlockQuoteTestcase2();
  // scannerBlockQuoteTestcase3();

  // // Blank Line
  // scannerBlankLineTestcase1();

  // // Indented Code
  // scannerIndentedCodeTestcase1();
  // scannerIndentedCodeTestcase2();
  // scannerIndentedCodeTestcase3();

  // // Hr
  // scannerHrTestcase1();

  // // Fenced Code
  // scannerFencedCodeTestcase1();
  // scannerFencedCodeTestcase2();
  // scannerFencedCodeTestcase3();

  // // Def
  // scannerDefTestcase1();
  // scannerDefTestcase2();
  // scannerDefTestcase3();

  // // Paragraph
  // scannerParagrahTestcase1();
  // scannerParagrahTestcase2();
}