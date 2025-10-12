import { Block  } from "./block";
import { Processer } from "./processer";

export const NODETAG = {
  Document: 0,

  // ContainerBlock
  BlockStart: 1,
  List: 2,
  ListItem: 3,
  BlockQuote: 4,

  // LeafBlock 
  Heading: 5,
  IndentedCode: 6,
  FencedCode: 7,
  HtmlBlock: 8,
  LinkReferenceDefinition: 9,
  Paragraph: 10,
  BlockEnd: 11,

  // inlines
  InlineStart: 12,
  Text: 13,
  CodeSpan: 14,
  Emphasis: 15,
  Link: 16,
  Image: 17,
  AutoLink: 18,
  RawHtml: 19,
  HardBreak: 20,
  SoftwareBreak: 21,
  InlineEnd: 22,
} as const;

export type NodeTag = typeof NODETAG[keyof typeof NODETAG];

export class Node {
  constructor(public readonly tag: NodeTag, public readonly element?: Block, public readonly process?: Processer) { }

  has_block(): boolean {
    return this.tag > NODETAG.BlockStart && this.tag < NODETAG.BlockEnd;
  }

  has_inline(): boolean {
    return this.tag > NODETAG.InlineStart && this.tag < NODETAG.InlineEnd
  }

  has_children(): boolean {
    return this.children.length != 0;
  }

  is_last_element_opened(): boolean {
    return this.get_last_node()?.element?.is_open() ?? false;
  }

  get_last_node(): Node | undefined {
    if (this.children.length != 0) {
      return this.children[this.children.length - 1];
    }
    return undefined;
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
