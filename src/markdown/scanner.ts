export interface Token {
  readonly Name: string
}

export interface HeadingToken extends Token {
  Text: string,
  Level: number
}

export interface blockQuoteToken extends Token {
  Token: Token | null;
}

export interface BlankLineToken extends Token {
}

const TAB_SIZE = 4;

export class Scanner {
  constructor(input: string) {
    this.input = input;
  }

  Scan(): Token | undefined {
    if (this.finish()) {
      return undefined;
    }

    let token = undefined;
    let numberOfBlankChar = this.leadingBlankChar();
    if ((token = this.blankLine()) != undefined) {
      return token;
    } else if (numberOfBlankChar < TAB_SIZE && (token = this.heading()) != undefined) {
      return token;
    } else if (numberOfBlankChar < TAB_SIZE && (token = this.blockQuote()) != undefined) {
      return token;
    }

    return token;
  }

  private blankLine(): BlankLineToken | undefined {
    let s = this.skipLine();
    for (let c of s) {
      if (c != ' ' && c != '\t' && c != '\n') {
        this.retrieve(s.length);
        return undefined;
      }
    }

    return { Name: "BlankLine" };
  }

  private heading(): HeadingToken | undefined {
    let s = this.skipChar('#', 6);
    if (s.length == 0) {
      return undefined;
    }

    if (this.peek() != ' ') {
      return undefined;
    }
    this.advance();

    let level = s.length;
    s = this.skipLine();

    return { Name: "Heading", Text: s, Level: level };
  }

  private blockQuote(): blockQuoteToken | undefined {
    let s = this.skipChar('>');
    if (s.length == 0) {
      return undefined;
    }

    if (this.peek() == '>') {
      return { Name: "BlockQuote", Token: null };
    }

    if (this.peek() == ' ') {
      this.advance();
    }

    return { Name: "BlockQuote", Token: this.Scan()! };
  }

  // Return the number of leading blank character.
  private leadingBlankChar(): number {
    let count = 0;
    let c = undefined;
    while ((c == this.peek()) != undefined) {
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

  private skipChar(skip: string, repeating: number = 1): string {
    let peek = undefined;
    let count = 0;
    let s = "";
    while ((peek = this.peek(skip.length)) != undefined) {
      if (peek != skip || count++ == repeating) {
        break;
      }
      s += peek;
      this.advance();
    }
    return s;
  }

  private skipUntil(until: string, repeating: number = 1): string {
    let peek = undefined;
    let count = 0;
    let s = "";
    while ((peek = this.peek(until.length)) != undefined) {
      s += peek;
      this.advance(until.length);
      if (peek == until && count++ == repeating) {
        break;
      }
    }
    return s;
  }

  private skipLine(lineEnd: string = '\n'): string {
    return this.skipUntil(lineEnd);
  }

  private peek(count: number = 1): string | undefined {
    if (this.finish()) {
      return undefined;
    }
    let peek = "";
    while (count-- > 0) {
      peek += this.input[this.offset];
    }
    return peek;
  }

  private advance(count: number = 1) {
    this.offset += count;
  }

  private retrieve(count: number = 1) {
    this.offset -= count;
  }

  private finish(): boolean {
    return this.offset == this.input.length;
  }

  private input: string;
  private offset: number = 0;
}

function ScannerHeadingTestcase1() {
  let heading = "# heading";
  let scanner = new Scanner(heading);
  console.info("### == ScannerHeadingTestcase1 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 1 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase1 == ###");
}

function ScannerHeadingTestcase2() {
  let input = "## heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase2 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 2 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase2 == ###");
}

function ScannerHeadingTestcase3() {
  let input = "### heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase3 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 3 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase3 == ###");
}

function ScannerHeadingTestcase4() {
  let input = "#### heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase4 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###")
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 4 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase4 == ###");
}

function ScannerHeadingTestcase5() {
  let input = "##### heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase5 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 5 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase5 == ###");
}

function ScannerHeadingTestcase6() {
  let input = "###### heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerHeadingTestcase6 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 6 &&
      (token as HeadingToken).Text == "heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerHeadingTestcase6 == ###");
}

function ScannerBlockQuoteTestcase1() {
  let input = "> # Heading";
  let scanner = new Scanner(input);
  console.info("### == ScannerBlockQuoteTestcase1 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as blockQuoteToken).Name == "BlockQuote" &&
      (token as blockQuoteToken).Token?.Name == "Heading") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerBlockQuoteTestcase1 == ###");
}

function ScannerBlockQuoteTestcase2() {
  let input = ">>";
  let scanner = new Scanner(input);
  console.info("### == ScannerBlockQuoteTestcase2 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as blockQuoteToken).Name == "BlockQuote" &&
      (token as blockQuoteToken).Token == null) {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerBlockQuoteTestcase2 == ###");
}

function ScannerCommonTestcase1() {
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

function ScannerBlankLineTestcase1() {
  let input = "     ";
  let scanner = new Scanner(input);
  console.info("### == ScannerBlankLineTestcase2 == ###");
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###");
  } else {
    if ((token as blockQuoteToken).Name == "BlankLine") {
      console.log("### TEST PASSED! ###");
    } else {
      console.error("### TEST FAILED! ###");
    }
  }
  console.info("### == ScannerBlankLineTestcase2 == ###");
}


export function ScannerTestcases() {
  // Common
  ScannerCommonTestcase1();

  // Heading
  ScannerHeadingTestcase1();
  ScannerHeadingTestcase2();
  ScannerHeadingTestcase3();
  ScannerHeadingTestcase4();
  ScannerHeadingTestcase5();
  ScannerHeadingTestcase6();

  // Block quote
  ScannerBlockQuoteTestcase1();
  ScannerBlockQuoteTestcase2();

  // Blank Line
  ScannerBlankLineTestcase1();
}