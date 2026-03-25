export const TAB_SIZE = 4;

export type Anchor = {
  position: number;
  row: number;
  column: number;
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
    return this.peek == undefined && this.position >= this.input.length;
  }

  is_eol(): boolean {
    return this.eol;
  }

  get_position(): number {
    return this.position;
  }

  set_postion(pos: number): void {
    this.position = pos;
    this.consume();
  }

  get_anchor(): Anchor {
    return {
      position: this.get_position(),
      row: this.row,
      column: this.column,
    }
  }

  set_anchor(a: Anchor): void {
    this.set_postion(a.position);
    this.row = a.row;
    this.column = a.column;
  }

  get_row(): number {
    return this.row;
  }

  get_column(): number {
    return this.column;
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
        this.eol = true;
        this.white_space_skiped = false;
      } else if (this.peek == '\r') {
        if (this.input[this.position + 1] == '\n') {
          this.position += 1;
        }
        this.row += 1;
        this.column = 1;
        this.eol = true;
        this.white_space_skiped = false;
      } else if (this.peek == '\r') {
      } else {
        this.column += 1;
        this.eol = false;
      }
      this.peek = this.input[this.position];
      this.position += 1;
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
    while(!this.is_eol()) {
      this.consume();
    }
    this.consume(); // skip the cr of lf
  }

  skip_whitespace(): void {
    let indent = 0;
    let tab_size = TAB_SIZE;
    while (!this.is_eos()) {
      if (this.peek == ' ') {
        indent += 1;
        tab_size -= 1;
        if (tab_size == 0) {
          tab_size = TAB_SIZE;
        }
      } else if (this.peek == '\t') {
        indent += tab_size;
        tab_size = TAB_SIZE;
      } else {
        break;
      }
      this.consume();
    }
    this.indent = indent;
  }

  skip_whitespaceII(): number {
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

  peek: string | undefined = undefined;
  indent: number = 0;
  row: number = 1;
  column: number = 1;

  private skip_whitespace_of_line_head(): void {
    if (this.white_space_skiped) {
      return;
    }

    this.indent = this.skip_whitespaceII();
    this.white_space_skiped = true;
  }

  private eol: boolean = false;
  private white_space_skiped: boolean = false;
  private position: number = 0;
  private input: string;
}
