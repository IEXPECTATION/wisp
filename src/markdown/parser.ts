import { Scanner, Token } from "./scanner";

interface Node {
  // Parent: Node | null;
  Token: Token | null;
  Children: Node[] | null;
}

export class Parser {
  constructor(scanner: Scanner) {
    this.scanner = scanner;
    this.root = { Token: null, Children: [] };
    this.openedNode = [];
    this.openedNode.push(this.root);
    this.currentNode = this.root;
  }

  Parse(): Node {
    let token = undefined;

    while ((token = this.scanner.Scan()) != undefined) {
      switch (token.Name) {
        case "Heading": {
          let last = this.openedNode[this.openedNode.length - 1];
          let node: Node = { Token: token, Children: null };
          last.Children!.push(node);
          this.currentNode = node
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