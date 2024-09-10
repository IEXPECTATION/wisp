import { Scanner, Tokens } from "./scanner";

export class Parser {
  constructor(scanner: Scanner) {
    this.scanner = scanner;
  }

  Parse(): Tokens {
    let token = undefined;

    while ((token = this.scanner.Scan()) != undefined) {
      this.tokens.push(token);
    }

    return this.tokens;
  }

  private scanner: Scanner;

  private tokens: Tokens = [];
}

export function ParserTestcases() {
}