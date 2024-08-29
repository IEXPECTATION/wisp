import { Scanner, Token } from "./scanner";

export interface Node {
  // Parent: Node | null;
  Token: Token | null;
  Children: Node[] | null;
}

export class Parser {
  constructor(scanner: Scanner) {
    this.scanner = scanner;
  }

  Parse(): Node {
    let token = undefined;

    while ((token = this.scanner.Scan()) != undefined) {
      this.cleanup(token.Name);

      switch (token.Name) {
        case "BlankLine":
        case "Heading": {
          let node: Node = { Token: token, Children: null };
          this.currentNode?.Children?.push(node);
        }
          break;
        case "BlockQuote": {

        }
          break;
      }
    }

    return this.root;
  }

  private cleanup(tokenName: string) {

  }

  private scanner: Scanner;

  private root: Node = { Token: null, Children: [] };
  private openedNode: Node[] = [];
  private indexOfMachtedNode: number = 0;
  private currentNode: Node = this.root;
}

export function ParserCommonTestcase1() {
  let input = "# heaidng";
  let parser = new Parser(new Scanner(input))
  console.info("### == ParserCommonTestcase1 == ###");
  let node = parser.Parse();
  if (node.Children?.length == 1 &&
    node.Children[0].Token?.Name == "Heading"
  ) {
    console.log("### TEST PASSED! ###");
  } else {
    console.error("### TEST FAILED! ###");
  }
  console.info("### == ParserCommonTestcase1 == ###");
}

export function ParserTestcases() {
  ParserCommonTestcase1();
}