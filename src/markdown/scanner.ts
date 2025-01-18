import { assert } from "console";

export class Scanner {
  constructor(input: string) {
    this.input = input;
  }

  Position() {
    return this.position;
  }

  End() {
    if (this.position < this.input.length) {
      return false;
    }

    return true;
  }

  Peek() {
    assert(!this.End());

    return this.input[this.position];
  }

  Skip() {
    assert(!this.End());

    this.position += 1;
  }

  Next() {
    assert(!this.End());

    this.position += 1;
    return this.input[this.position];
  }

  Consume(char: string) {
    let peek = this.Peek();
    if (peek == char) {
      this.position += 1;
      return true;
    }

    return false;
  }

  Push() {
    this.anchor.push(this.position);
  }

  Pop() {
    assert(this.anchor.length > 0);

    this.position = this.anchor.pop()!;
  }

  Clear() {
    this.anchor = [];
  }

  private input: string;
  private position: number = 0;
  private anchor: number[] = [];
}