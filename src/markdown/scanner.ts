type Token = {} | HeadingToken;

type HeadingToken = {
  Name: "Heading",
  Raw: string,
  Text: string,
  Level: number,
  Children: Token[],
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

    if(this.leadingBlankChar() >= 4) {
      
    } 
  }

  private heading(): HeadingToken {
    return { Name: "Heading", Raw: "", Text: "", Level: 1, Children: [] };
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


  private skipChar(skip: string, repeating: number = 1) {
    let peek = undefined;
    let count = 0;
    while ((peek = this.peek(skip.length)) != undefined) {
      if (peek != skip || count++ == repeating) {
        break;
      }
      this.advance();
    }
  }

  private skipUntil(until: string, repeating: number = 1) {
    let peek = undefined;
    let count = 0;
    while ((peek = this.peek(until.length)) != undefined) {
      this.advance(until.length);
      if (peek == until && count++ == repeating) {
        break;
      }
    }
  }

  private skipLine(lineEnd: string = '\n') {
    this.skipUntil(lineEnd);
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

let scanner = new Scanner("abc");
scanner.Scan();