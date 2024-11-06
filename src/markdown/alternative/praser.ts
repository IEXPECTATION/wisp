import { Scanner } from "../scanner";

export { }

class Parser {

  Parse(input: string): Node {
    return this.parse(new Scanner(input));
  }

  parse(scanner: Scanner): Node {
    return new Document();
  }
}