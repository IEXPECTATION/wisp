import { Block } from "./block";
import { Processor } from "./processor";

export const NODETAG = {
  Document: 0,

  // ContainerBlock
  ContainerBlockStart: 1,
  List: 2,
  ListItem: 3,
  BlockQuote: 4,
  ContainerBlockEnd: 5,

  // LeafBlock 
  LeafBlockStart: 6,
  Heading: 7,
  IndentedCode: 8,
  FencedCode: 9,
  HtmlBlock: 10,
  LinkReferenceDefinition: 11,
  Paragraph: 12,
  BlockEnd: 13,
  LeafBlockEnd: 14,

  // inlines
  InlineStart: 15,
  Text: 16,
  CodeSpan: 17,
  Emphasis: 18,
  Link: 19,
  Image: 20,
  AutoLink: 21,
  RawHtml: 22,
  HardBreak: 23,
  SoftwareBreak: 24,
  InlineEnd: 25,
} as const;

export type NodeTag = typeof NODETAG[keyof typeof NODETAG];

export class Node {
  constructor(public readonly tag: NodeTag, public readonly element?: Block, public readonly process?: Processor) { }

  is_container_block(): boolean {
    return this.tag > NODETAG.ContainerBlockStart && this.tag < NODETAG.ContainerBlockEnd;
  }
  
  is_left_block(): boolean {
    return this.tag > NODETAG.LeafBlockStart && this.tag < NODETAG.LeafBlockEnd;
  }

  is_block(): boolean {
    return this.is_container_block() || this.is_left_block();
  }

  is_inline(): boolean {
    return this.tag > NODETAG.InlineStart && this.tag < NODETAG.InlineEnd
  }

  has_children(): boolean {
    return this.children.length != 0;
  }

  is_last_element_opened(): boolean {
    return this.get_last_node()?.element?.is_open() ?? false;
  }

  get_last_node(): Node | null {
    if (this.children.length != 0) {
      return this.children[this.children.length - 1];
    }
    return undefined;
  }

  push_node(n: Node) {
    if (!this.children.includes(n)) {
      this.children.push(n);
      n.parent = this;
    }
  }

  pop_node(): Node | undefined {
    return this.children.pop()
  }

  parent: Node | null = null;
  private children: Node[] = [];
}
