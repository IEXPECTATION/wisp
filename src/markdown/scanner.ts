export const ArriveEndOfInput = new Error("Arrive the end of input string.");

export class Scanner {
  constructor(input: string) {
    this.input = input;
    const err = this.readline();
    if (err != null) {
      throw err;
    }
  }

  get_row(): number {
    return this.row;
  }

  get_column(): number {
    return this.column;
  }

  get_position(): number {
    return this.position;
  }

  peekline(): string {
    return this.line_buffer.substring(this.column);
  }

  get_indent() {
    return this.indent;
  }

  scan_indent() {
    const line = this.peekline();
    this.indent = 0;
    let column = 0;  
    for (let c of line) {
      if (c == ' ') {
        this.indent += 1;
      } else if (c == '\t') {
        this.indent += 4;
      } else {
        break;
      }
      column += 1;
    }
    this.consume(column);
  }

  is_bank_line(): boolean {
    let line = this.peekline();
    for (let c of line) {
      if (c != ' ' && c != '\t' && c != '\r' && c != '\n') {
        return false;
      }
    }
    return true;
  }

  consume(n: number = 1): void {
    if (this.column + n < 0) {
      return;
    }

    if (this.column + n >= this.line_buffer.length) {
      this.column = this.line_buffer.length;
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
      this.position += 1;
      s += c;
      if (c == '\r') {
        if (is_return) {
          this.position -= 1;
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
  private indent:number = 0;
}
