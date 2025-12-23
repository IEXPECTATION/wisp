import { Context } from "./context";

export const NODE_TAG = {
  Dummy: 0,
  Document: 1,

  // ContainerBlock
  ContainerBlockStart: 2,
  List: 3,
  ListItem: 4,
  BlockQuote: 5,
  ContainerBlockEnd: 6,

  // LeafBlock 
  LeafBlockStart: 7,
  ThematicBreak: 8,
  Heading: 9,
  IndentedCode: 10,
  FencedCode: 11,
  HtmlBlock: 12,
  LinkReferenceDefinition: 13,
  Paragraph: 14,
  LeafBlockEnd: 15,

  // inlines
  InlineStart: 16,
  Text: 17,
  CodeSpan: 18,
  Emphasis: 19,
  Link: 20,
  Image: 21,
  AutoLink: 22,
  RawHtml: 23,
  HardBreak: 24,
  SoftwareBreak: 25,
  InlineEnd: 26,
} as const;

export type NodeTag = typeof NODE_TAG[keyof typeof NODE_TAG];

export class Node {
  constructor(public readonly tag: NodeTag, public readonly context?: Context) { }

  is(tag: NodeTag): boolean {
    return this.tag == tag;
  }

  is_not(tag: NodeTag): boolean {
    return this.tag != tag;
  }

  is_container_block(): boolean {
    return this.tag > NODE_TAG.ContainerBlockStart && this.tag < NODE_TAG.ContainerBlockEnd;
  }

  is_left_block(): boolean {
    return this.tag > NODE_TAG.LeafBlockStart && this.tag < NODE_TAG.LeafBlockEnd;
  }

  is_block(): boolean {
    return this.is_container_block() || this.is_left_block();
  }

  is_inline(): boolean {
    return this.tag > NODE_TAG.InlineStart && this.tag < NODE_TAG.InlineEnd
  }

  has_children(): boolean {
    return this.children.length != 0;
  }

  get_children(): Node[] {
    return this.children;
  }

  push_node(n: Node) {
    if (!this.children.includes(n)) {
      this.children.push(n);
    }
  }

  pop_node(): Node | undefined {
    return this.children.pop()
  }

  private children: Node[] = [];
}
