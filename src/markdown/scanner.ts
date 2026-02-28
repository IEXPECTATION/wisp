export const TAB_SIZE = 4;

export type Anchor = {
  position: number;
  row: number;
  column: number;
}

export class Scanner {
  constructor(input: string) {
    this.input = input;
  }

  is_eof(): boolean {
    return this.peek == undefined;
  }

  get_position(): number {
    return this.position - 1;
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

  get_content(start: number, end?: number): string {
    return this.input.substring(start, end);
  }

  consume(): void {
    if (this.position >= this.input.length) {
      this.peek = undefined;
    } else {
      if (this.peek == '\n') {
        this.row += 1;
        this.column = 1;
      } else if (this.peek == '\r') {
        this.consume_if('\n');
        this.row += 1;
        this.column = 1;
      } else {
        this.column += 1;
      }
      this.peek = this.input[this.position];
      this.position += 1;
    }
  }

  consume_if(c: string): boolean {
    if (this.peek == c) {
      this.peek = this.input[this.position];
      this.position += 1;
      return true;
    }
    return false;
  }

  consume_line(): void {
    const r = this.row;
    while (this.peek != undefined && r == this.row) {
      this.consume();
    }
    this.consume_if("\n");
  }

  skip_whitespace(): void {
    let indent = 0;
    let tab_size = TAB_SIZE;
    while (!this.is_eof()) {
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

  peek: string | undefined = undefined;
  indent: number = 0;

  private row: number = 1;
  private column = 0;
  private position: number = 0;
  private input: string;
}
