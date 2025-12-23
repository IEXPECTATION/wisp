export const ArriveEndOfInput = new Error("Arrive the end of input string.");

export const TAB_SIZE = 4;

export class Scanner {
  constructor(input: string) {
    this.input = input;
  }

  is_eof(): boolean {
    if (this.position >= this.input.length) {
      return true;
    }
    return false;
  }

  get_position(): number {
    return this.position - 1;
  }

  set_postion(pos: number): void {
    this.position = pos;
    this.consume();
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

  skip_whitespace(): [number, boolean] {
    if (this.peek == undefined) {
      return [0, false];
    }

    let indent = 0;
    let tab_size = TAB_SIZE;
    while (true) {
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
      this.consume()
    }

    return [indent, true];
  }

  consume(): void {
    if (this.position >= this.input.length) {
      this.peek = undefined;
    } else {
      this.peek = this.input[this.position];
      this.position += 1;
      this.column += 1;
    }
  }

  consume_if(c: string): boolean {
    if (this.peek == c) {
      this.consume()
      return true;
    }
    return false;
  }

  consume_line(): void {
    while (this.position < this.input.length) {
      if (this.peek == '\r') {
        this.consume();
        this.increment_row();
        if (this.consume_if('\n')) {
          this.column -= 1;
        }
        break;
      } else if (this.peek == '\n') {
        this.increment_row();
        this.consume();
        break;
      } else {
        this.consume();
      }
    }
  }
  
  increment_row(): void {
    this.row += 1;
    this.column = 0;
  }

  peek: string | undefined = undefined;
  private row: number = 1;
  private column = 0;
  private position: number = 0;
  private input: string;
}
