export const ArriveEndOfInput = new Error("Arrive the end of input string.");

export class Scanner {
  constructor(input: string) {
    this.input = input;
    const err = this.readline();
    if(err != null) {
      throw err;
    }
  }

  peekline(): string {
    return this.line_buffer.substring(this.column);
  }

  advance(n: number = 1): void {
    if (this.column + n < 0 || this.column + n < this.line_buffer.length) {
      return;
    }
    this.column += n;
  }

  readline(): Error | null {
    if (this.position == this.input.length) {
      return ArriveEndOfInput;
    }

    let is_return = false;
    let s = "";

    while (this.position < this.input.length) {
      const c = this.input[this.position];
      s += c;
      if (c == '\r') {
        if (is_return) {
          break;
        }
        is_return = true;
      } else if (c == '\n') {
        break;
      } else { }
    }

    this.column = 0;
    this.row += 1;
    this.line_buffer = s;
    return null;
  }

  private row: number = 0;
  private column: number = 0;
  private line_buffer: string = "";
  private position: number = 0;
  private input: string;
}
