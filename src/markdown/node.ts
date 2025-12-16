type Location = {
  row: number,
  column: number,
  start: number;
  end: number;
};

export const NODE_TAG = {
  Document: 0,

  // ContainerBlock
  ContainerBlockStart: 1,
  List: 2,
  ListItem: 3,
  BlockQuote: 4,
  ContainerBlockEnd: 5,

  // LeafBlock 
  LeafBlockStart: 6,
  ThematicBreak: 7,
  Heading: 8,
  IndentedCode: 9,
  FencedCode: 10,
  HtmlBlock: 11,
  LinkReferenceDefinition: 12,
  Paragraph: 13,
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

export type NodeTag = typeof NODE_TAG[keyof typeof NODE_TAG];

export class Node {
  constructor(public readonly tag: NodeTag, public readonly localtion?: Location, public readonly context?: Context) { }

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
