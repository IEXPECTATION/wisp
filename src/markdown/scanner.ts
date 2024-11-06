
export class Scanner {
  constructor(input: string) {
    this.input = input;
  }

  Eos() {
    return this.offset == this.input.length;
  }

  Peek() {
    if (this.Eos()) {
      return undefined;
    }

    return this.input[this.offset];
  }

  Next(count: number = 1) {
    if (this.Eos()) {
      return undefined;
    }

    let next = this.input.substring(this.offset, this.offset + count);
    this.offset += count;
    return next;
  }

  Advance(count: number = 1) {
    this.offset += count;
  }

  Retreat(count: number = 1) {
    this.offset -= count;
  }

  Consume(char: string) {
    if (this.Peek() == char) {
      this.Advance();
      return true;
    }
    return false;
  }

  Anchor() {
    this.anchor = this.offset;
  }

  FlashBack() {
    this.offset = this.anchor;
  }

  private input: string;
  private offset: number = 0;
  private anchor: number = 0;
}

export function ScannerTestcases() {
}