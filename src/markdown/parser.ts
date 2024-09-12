import { Scanner, Tokens } from "./scanner";

export class PasrerConfig {

};
const TAB_SIZE = 4;

export class Parser {
  constructor(config: PasrerConfig) {
    this.config = config;
  }

  Parse(input: string) {
    let scanner = new Scanner(input);
    this.parse(scanner);
  }

  private parse(scanner: Scanner) {
    let tokens: Tokens = [];
    while (!scanner.Eof()) {
      if (this.blankline(tokens, scanner)) {
        continue;
      }

      if (scanner.WhiteSpace() == TAB_SIZE) {
        if (this.fencedCode(tokens, scanner)) {
          continue;
        }

        throw new Error("Unknown element of markdown!");
      }

      if (this.heading(tokens, scanner)) {
        continue;
      }

      if (this.heading(tokens, scanner)) {
        continue;
      }

      if (this.blockQuote(tokens, scanner)) {
        continue;
      }

      if (this.indentedCode(tokens, scanner)) {
        continue;
      }

      if (this.hr(tokens, scanner)) {
        continue;
      }

      if (this.def(tokens, scanner)) {
        continue;
      }

      if (this.paragraph(tokens, scanner)) {
        continue;
      }
    }
    return tokens;
  }

  private blankline(tokens: Tokens, scanner: Scanner) {
    return false;
  }

  private heading(tokens: Tokens, scanner: Scanner): boolean {
    return false;
  }

  private blockQuote(tokens: Tokens, scanner: Scanner) {

    return false;
  }

  private indentedCode(tokens: Tokens, scanner: Scanner) {

    return false;
  }

  private hr(tokens: Tokens, scanner: Scanner) {

    return false;
  }

  private fencedCode(tokens: Tokens, scanner: Scanner) {

    return false;
  }

  private def(tokens: Tokens, scanner: Scanner) {

    return false;
  }

  private paragraph(tokens: Tokens, scanner: Scanner) {

    return false;
  }


  private config: PasrerConfig;
}

export function ParserTestcases() {
}