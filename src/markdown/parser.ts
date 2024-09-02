import { blockQuoteToken, IndentedCodeToken, Scanner, Token } from "./scanner";

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
      this.prase(token);
    }

    return this.root;
  }

  private prase(token: Token) {
    switch (token.Name) {
      case "BlankLine":
      case "Heading": {
        let node: Node = { Token: token, Children: null };
        this.currentNode!.Children!.push(node);
      }
        break;
      case "BlockQuote": {
        let bq = token as blockQuoteToken;
        if (bq.Token != undefined) {
          return;
        }

        if(this.openedNodes.length == 0 || this.openedNodes[this.openedNodes.length - 1].Token?.Name != "BlockQuote") {
        }
      }
        break;
    }
  }



  private scanner: Scanner;

  private root: Node = { Token: null, Children: [] };
  private openedNodes: Node[] = [];
  private matchedNodeIndex = 0;
  private matchedNodeIndexs: number[] = [];
  private currentNode: Node | undefined = this.root;
}

function ParserCommonTestcase1() {
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

function ParserCommonTestcase2() {
  let input = ">     code line 1";
  let parser = new Parser(new Scanner(input))
  console.info("### == ParserCommonTestcase2 == ###");
  let node = parser.Parse();
  if (node.Children?.length == 1 &&
    node.Children[0].Token?.Name == "BlockQuote"
  ) {
    console.log("### TEST PASSED! ###");
  } else {
    console.error("### TEST FAILED! ###");
  }
  console.info("### == ParserCommonTestcase2 == ###");
}

function ParserCommonTestcase3() {
  let input = ">>     code line 1";
  let parser = new Parser(new Scanner(input))
  console.info("### == ParserCommonTestcase3 == ###");
  let node = parser.Parse();
  if (node.Children?.length == 1 &&
    node.Children[0].Token?.Name == "BlockQuote"
  ) {
    console.log("### TEST PASSED! ###");
  } else {
    console.error("### TEST FAILED! ###");
  }
  console.info("### == ParserCommonTestcase3 == ###");
}


export function ParserTestcases() {
  ParserCommonTestcase1();
  ParserCommonTestcase2();
  ParserCommonTestcase3();
}