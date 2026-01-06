import { Context } from "./context";

export const NODE_TAG = {
  Dummy: 0,
  Document: 1,

  // ContainerBlock
  ContainerBlockStart: 2,
  OrderedList: 3,
  UnorderedList: 4,
  ListItem: 5,
  BlockQuote: 6,
  ContainerBlockEnd: 7,

  // LeafBlock 
  LeafBlockStart: 8,
  ThematicBreak: 9,
  Heading: 10,
  IndentedCode: 11,
  FencedCode: 12,
  HtmlBlock: 13,
  LinkReferenceDefinition: 14,
  Paragraph: 15,
  LeafBlockEnd: 16,

  // inlines
  InlineStart: 17,
  Text: 18,
  CodeSpan: 18,
  Emphasis: 20,
  Link: 21,
  Image: 22,
  AutoLink: 23,
  RawHtml: 24,
  HardBreak: 25,
  SoftwareBreak: 26,
  InlineEnd: 27,
} as const;

export type NodeTag = typeof NODE_TAG[keyof typeof NODE_TAG];

export class Node {
  constructor(public tag: NodeTag, public context?: Context) { }

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
