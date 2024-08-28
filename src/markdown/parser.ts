import { Scanner, Token } from "./scanner";

export interface Node {
  // Parent: Node | null;
  Token: Token | null;
  Children: Node[] | null;
}

export class Parser {
  constructor(scanner: Scanner) {
    this.scanner = scanner;
    this.root = { Token: null, Children: [] };
    this.openedNode = [];
    this.currentNode = this.root;
  }

  Parse(): Node {
    let token = undefined;

    while ((token = this.scanner.Scan()) != undefined) {
      let last = this.openedNode[this.openedNode.length - 1];
      let node: Node = { Token: token, Children: null };
      switch (token.Name) {
        case "BlankLine":
        case "Heading": {
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

  private scanner: Scanner;

  private root: Node;
  private openedNode: Node[];
  private currentNode: Node | undefined;
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

ParserCommonTestcase1();