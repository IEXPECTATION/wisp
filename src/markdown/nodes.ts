export enum NodeTag {
  Document,
  Text,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Hr,
  Block,
  Italic,
  BlockItalic,
  Code,
  CodeSpan,
  Link,
  BlockQuote,
  Paragraph,
  Ol,
  Ul,
  Li,
  Image,
  SoftBreak,
};

export type Nodes = Node[];

export class Node {
  Tag: NodeTag;

  constructor(tag: NodeTag) {
    this.Tag = tag;
  }

  Parent(): Node | null {
    return this.parent;
  }

  SetParent(target: Node): void {
    if (this.parent == null) {
      this.parent = target;
    }
  }

  Children(): Nodes {
    return this.nodes;
  }

  SetChild(target: Node): void {
    this.nodes.push(target);
    target.SetParent(this);
  }

  Text(): string | null {
    return this.text;
  }

  SetText(text: string) {
    this.text = text;
  }

  private parent: Node | null = null;
  private nodes: Nodes = [];
  private text: string | null = null;
}