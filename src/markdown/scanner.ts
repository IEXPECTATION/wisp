export interface Token {
  readonly Name: string
}

export interface HeadingToken extends Token {
  Text: string,
  Level: number
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

    if (numberOfBlankChar < TAB_SIZE && (token = this.heading()) != undefined) {
      return token;
    }

    return token;
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

  private retrive(count: number = 1) {
    this.offset -= count;
  }

  private finish(): boolean {
    return this.offset == this.input.length;
  }

  private input: string;
  private offset: number = 0;
}

export function ScannerHeadingTestcase1() {
  let heading = "# heading";
  let scanner = new Scanner(heading);
  console.info("### == ScannerHeadingTestcase1 == ###")
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###")
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 1 &&
      (token as HeadingToken).Text == "heading") {
        console.log("### TEST PASSED! ###")
    } else {
      console.log("### TEST FAILED! ###")
    }
  }
  console.info("### == ScannerHeadingTestcase1 == ###\n")
}

function ScannerHeadingTestcase2() {
  let heading = "## heading";
  let scanner = new Scanner(heading);
  console.info("### == ScannerHeadingTestcase2 == ###")
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###")
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 2 &&
      (token as HeadingToken).Text == "heading") {
        console.log("### TEST PASSED! ###")
    } else {
      console.log("### TEST FAILED! ###")
    }
  }
  console.info("### == ScannerHeadingTestcase2 == ###")
}

function ScannerHeadingTestcase3() {
  let heading = "### heading";
  let scanner = new Scanner(heading);
  console.info("### == ScannerHeadingTestcase3 == ###")
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###")
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 3 &&
      (token as HeadingToken).Text == "heading") {
        console.log("### TEST PASSED! ###")
    } else {
      console.log("### TEST FAILED! ###")
    }
  }
  console.info("### == ScannerHeadingTestcase3 == ###")
}

function ScannerHeadingTestcase4() {
  let heading = "#### heading";
  let scanner = new Scanner(heading);
  console.info("### == ScannerHeadingTestcase4 == ###")
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###")
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 4 &&
      (token as HeadingToken).Text == "heading") {
        console.log("### TEST PASSED! ###")
    } else {
      console.log("### TEST FAILED! ###")
    }
  }
  console.info("### == ScannerHeadingTestcase4 == ###")
}

function ScannerHeadingTestcase5() {
  let heading = "##### heading";
  let scanner = new Scanner(heading);
  console.info("### == ScannerHeadingTestcase5 == ###")
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###")
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 5 &&
      (token as HeadingToken).Text == "heading") {
        console.log("### TEST PASSED! ###")
    } else {
      console.log("### TEST FAILED! ###")
    }
  }
  console.info("### == ScannerHeadingTestcase5 == ###")
}

function ScannerHeadingTestcase6() {
  let heading = "###### heading";
  let scanner = new Scanner(heading);
  console.info("### == ScannerHeadingTestcase6 == ###")
  let token = scanner.Scan();
  if (token == undefined) {
    console.error("### TEST FAILED! ###")
  } else {
    if ((token as HeadingToken).Name == "Heading" &&
      (token as HeadingToken).Level == 6 &&
      (token as HeadingToken).Text == "heading") {
        console.log("### TEST PASSED! ###")
    } else {
      console.log("### TEST FAILED! ###")
    }
  }
  console.info("### == ScannerHeadingTestcase6 == ###")
}

export function ScannerTestcases() {
  ScannerHeadingTestcase1();
  ScannerHeadingTestcase2();
  ScannerHeadingTestcase3();
  ScannerHeadingTestcase4();
  ScannerHeadingTestcase5();
  ScannerHeadingTestcase6();
}