export const TAB_SIZE = 4;

export type Anchor = {
  peek?: string,
  row: number,
  column: number,
  newline: boolean,
  position: number,
}

export class Scanner {
  constructor(input: string) {
    this.input = input;
    if (this.input.length > 0) {
      this.peek = this.input[this.position];
      this.skip_whitespace_of_line_head();
    }
  }

  is_eos(): boolean {
    return this.position >= this.input.length && this.peek == undefined;
  }

  is_newline(): boolean {
    return this.newline;
  }

  get_position(): number {
    return this.position;
  }

  get_anchor(): Anchor {
    return {
      peek: this.peek,
      row: this.row,
      column: this.column,
      newline: this.newline,
      position: this.position,
    }
  }

  set_anchor(a: Anchor) {
    this.peek = a.peek;
    this.row = a.row;
    this.column = a.column;
    this.newline = a.newline;
    this.position = a.position;
  }

  get_content(start: number, end: number = this.input.length): string {
    return this.input.substring(start, end);
  }

  consume(): void {
    if (this.position >= this.input.length) {
      this.peek = undefined;
    } else {
      if (this.peek == '\n') {
        this.row += 1;
        this.column = 1;
        this.newline = true;
      } else if (this.peek == '\r') {
        this.row += 1;
        this.column = 1;
        this.newline = true;
        this.advance_if('\n');
      } else {
        this.column += 1;
        this.newline = false;
      }
      this.advance();
      if (this.is_newline()) {
        this.skip_whitespace_of_line_head();
      }
    }
  }

  consume_if(c: string): boolean {
    if (this.peek == c) {
      this.consume();
      return true;
    }
    return false;
  }

  consume_line(): void {
    while (!this.is_newline()) {
      this.consume();
    }
  }

  skip_whitespace(): number {
    let indent = 0;
    let tab_size = 0;
    while (!this.is_eos()) {
      if (this.peek == ' ') {
        indent += 1;
      } else if (this.peek == '\t') {
        tab_size = TAB_SIZE - (this.column % TAB_SIZE);
        indent += tab_size;
      } else {
        break;
      }
      this.consume();
    }

    return indent;
  }

  peek?: string = undefined;
  indent: number = 0;
  row: number = 1;
  column: number = 1;

  private skip_whitespace_of_line_head(): void {
    this.indent = this.skip_whitespace();
  }

  private advance(): void {
    this.position += 1;
    this.peek = this.input[this.position];
  }

  private advance_if(c: string): void {
    if (this.input[this.position + 1] == c) {
      this.position += 1;
      this.peek = this.input[this.position];
    }
  }

  private newline: boolean = false;
  private position: number = 0;
  private input: string;
}
