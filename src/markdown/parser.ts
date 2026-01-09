import { BlockQuoteContext, FencedCodeContext, HeadingContext, IndentedCodeContext, ParagraphContext, ThematicBreakContext, UnorderedListContext } from "./context";
import { Node, NODE_TAG } from "./node";
import { Scanner, TAB_SIZE } from "./scanner";

const DummyBlock = new Node(NODE_TAG.Dummy);

export class Parser {
  constructor(private readonly scanner: Scanner) { scanner.consume(); }

  parse(): Node | Error {
    let document = new Node(NODE_TAG.Document);
    let err = this.parse_block(document);
    if (err != null) {
      return err;
    }
    return document;
  }

  private parse_block(root: Node): Error | null {
    let parent = root;
    while (true) {
      while (true) {
        // Firstly, we try to open a new block.
        const node = this.try_open_block(parent);

        if (node == null) {
          return null;
        }

        if (node.is(NODE_TAG.Dummy)) {
          break;
        }

        // Push this node to our cache.
        if (this.is_continuation_paragraph() && node.is_not(NODE_TAG.Paragraph)) {
          // We expect a dummy node when we is on continuation paragraph mode.
          // If we don't get a dummy node, we should pop the last paragraph node.
          this.cached_nodes.pop();
        }
        this.cached_nodes.push(node);
        if (node.is_left_block()) {
          // If we open a new leaf block, It means the current line has been parsed.
          // So we move to the next line.
          break;
        }

        // Otherwise, we open a container block. Continue to open new block.
        console.assert(node.is_container_block(), "The opened node is not a container block!");
        parent = node;
      }

      // Continue to parse the next line.
      while (true) {
        // parse the multiple lines block
        if (this.scanner.is_eof()) {
          return null;
        }

        if (this.cached_nodes.length == 0) {
          break;
        }

        let index = 0;
        let matched = true;
        while (index < this.cached_nodes.length) {
          switch (this.cached_nodes[index].tag) {
            case NODE_TAG.OrderedList:
              break;
            case NODE_TAG.UnorderedList:
              break;
            case NODE_TAG.ListItem:
              break;
            case NODE_TAG.BlockQuote:
              if (!this.continue_blockquote()) {
                matched = false;
              }
              break;
            case NODE_TAG.IndentedCode:
              if (!this.cotninue_indentedcode(this.cached_nodes[index])) {
                matched = false;
              }
              break;
            case NODE_TAG.FencedCode:
              if (!this.continue_fencedcode(this.cached_nodes[index])) {
                matched = false;
              }
              break;
            case NODE_TAG.HtmlBlock:
              break;
            default:
              matched = false;
              break;
          }

          if (!matched) {
            // Current block is not matched, It means there is a new block. we try to open it later.
            break;
          }
          index += 1;
        }

        if (index == this.cached_nodes.length && this.cached_nodes[index - 1].is_left_block() && !this.cached_nodes[index - 1].is(NODE_TAG.Paragraph)) {
          // multiple line leaf block, like indented code and fenced code
          continue;
        }

        // close all blocks from index to the last one.
        const is_continuation_paragraph = this.is_continuation_paragraph();
        if (is_continuation_paragraph) {
          let cur_parent = root;
          if (index != 0) {
            cur_parent = this.cached_nodes[index - 1];
          }

          const node = this.try_open_block(cur_parent);
          if (node == null) {
            return null;
          }

          // If we don't get the a dummy node, It means we have a new block.
          if (node.is_not(NODE_TAG.Dummy)) {
            this.clear_cached_blocks(index, this.cached_nodes.length);
            this.cached_nodes.push(node);

            // If we get a container block, we must exit to read lines and try to open new block.
            if (node.is_container_block()) {
              cur_parent = node;
              parent = cur_parent;
              break;
            }
          }
        } else {
          this.clear_cached_blocks(index, this.cached_nodes.length);
          parent = root;
          if (index != 0) {
            parent = this.cached_nodes[index - 1];
          }
          break;
        }
      }
    }
  }

  private try_open_block(parent: Node): Node | null {
    const [indent, ok] = this.scanner.skip_whitespace();
    if (!ok) {
      return null;
    }

    const is_continuation_paragraph = this.is_continuation_paragraph();
    if (!is_continuation_paragraph && indent >= TAB_SIZE) {
      // indented code
      let padding = 0;
      if (indent > TAB_SIZE) {
        padding = indent - TAB_SIZE;
      }
      return this.parse_indentedcode(parent, padding);
    }

    switch (this.scanner.peek) {
      case '*':
      case '-': {
        // thematic break or unordered list
        if (!is_continuation_paragraph) {
          let node = this.parse_thematicbreak(parent);
          if (node != null) {
            return node;
          }
        }

        let node = this.parse_unorderedlist(parent, indent);
        if (node != null) {
          return node;
        }

        if(is_continuation_paragraph) {
          // maybe a setext heading
          break;
        }
        return null;
      }
      case '_':
        // thematic break
        return this.parse_thematicbreak(parent);
      case '+':
        // unordered list
        return this.parse_unorderedlist(parent, indent);
      case '>':
        // blockquote
        return this.parse_blockquote(parent);
      case '#':
        // atx heading
        return this.parse_heading(parent);
      case '~':
      case '`':
        // fenced code
        return this.parse_fencedcode(parent, indent);
      case '<':
        // html block
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9': {
        // ordered list
        if(is_continuation_paragraph && this.scanner.peek != '1') {
          break;
        }
        return this.parse_orderedlist(parent);
      }
      default:
        // We check whether this line is blank line here.
        const is = this.is_blank_line();
        if (is && is_continuation_paragraph) {
          this.cached_nodes.pop();
          return DummyBlock;
        }

        // If the parent is unordered list or ordered list, we should create a list item node.
        if(parent.tag == NODE_TAG.UnorderedList || parent.tag == NODE_TAG.OrderedList) {
          const li = new Node(NODE_TAG.ListItem);
          parent.push_node(li);
          return li;
        }
        break;
    }

    // fallback to paragraph
    if (is_continuation_paragraph) {
      // Parse this line whether is setext heading.
      const last_node = this.cached_nodes[this.cached_nodes.length - 1];
      if (!this.parse_setext_heading(last_node)) {
        this.continue_paragraph(last_node);
      }
      return DummyBlock;
    } else {
      // parse the paragraph
      // create a new paragraph node
      return this.parse_paragraph(parent);
    }
  }

  private parse_unorderedlist(parent: Node, offset: number): Node | null {
    const anchor = this.scanner.get_anchor();
    const bullet = this.scanner.peek;
    offset += 1;
    this.scanner.consume();

    const [indent, ok] = this.scanner.skip_whitespace();
    if (!ok) {
      this.scanner.set_anchor(anchor);
      return null;
    }

    if(indent == 0) {
      this.scanner.set_anchor(anchor);
      return null;
    }

    offset += indent;
    const ul = new Node(NODE_TAG.UnorderedList, {} as UnorderedListContext);
    parent.push_node(ul);
    return ul;
  }

  private parse_orderedlist(parent: Node): Node | null {
    return null;
  }

  private parse_blockquote(parent: Node): Node | null {
    const start = this.scanner.get_position();
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    this.scanner.consume();
    this.scanner.consume_if(' ');
    const end = this.scanner.get_position();

    const bq = new Node(NODE_TAG.BlockQuote, { location: { row, column, start, end } } as BlockQuoteContext);
    parent.push_node(bq);
    return bq;
  }

  private parse_thematicbreak(parent: Node): Node | null {
    const anchor = this.scanner.get_anchor();
    const start = this.scanner.get_position();
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();

    let length = 1;
    const bullet = this.scanner.peek;
    this.scanner.consume();
    while (this.scanner.peek && (this.scanner.peek == ' ' || this.scanner.peek == '\t' || this.scanner.peek == bullet)) {
      this.scanner.consume();
      length += 1;
    }

    if (length < 3) {
      this.scanner.set_anchor(anchor);
      return null;
    }
    const end = this.scanner.get_position();

    const tb = new Node(NODE_TAG.ThematicBreak, { location: { row, column, start, end } } as ThematicBreakContext);
    parent.push_node(tb);
    return tb;
  }

  private parse_heading(parent: Node): Node | null {
    const anchor = this.scanner.get_anchor();
    let level = 1;
    this.scanner.consume();
    while (this.scanner.consume_if('#')) {
      level += 1;
    }

    if (level > 6 || this.scanner.peek != ' ') {
      this.scanner.set_anchor(anchor);
      return null;
    }
    this.scanner.consume();

    const start = this.scanner.get_position();
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    this.scanner.consume_line();
    const end = this.scanner.get_position();
    const h = new Node(NODE_TAG.Heading, { locations: [{ row, column, start, end }], level } as HeadingContext);
    parent.push_node(h);
    return h;
  }

  private parse_setext_heading(paragraph: Node): boolean {
    console.assert(paragraph.is(NODE_TAG.Paragraph), "The node is not a paragraph node.");
    const anchor = this.scanner.get_anchor();
    // const [_, ok] = this.scanner.skip_whitespace();
    // if (!ok) {
    //   return false;
    // }

    const bullet = this.scanner.peek;
    if (bullet != '=' && bullet != '-') {
      this.scanner.set_anchor(anchor);
      return false;
    }

    this.scanner.consume();
    let is = true;
    while (this.scanner.peek && this.scanner.peek != '\r' && this.scanner.peek != '\n') {
      if (!this.scanner.consume_if(bullet)) {
        is = false;
        break;
      }
    }

    if (!is) {
      this.scanner.set_anchor(anchor);
      return false;
    }

    if (this.scanner.peek == '\r') {
      this.scanner.consume_if('\n');
    }

    let level = 1;
    if (bullet == '-') {
      level = 2;
    }

    const paragraph_context = paragraph.context as ParagraphContext;
    const ctx = { locations: paragraph_context.locations, level: level } as HeadingContext;
    paragraph.tag = NODE_TAG.Heading;
    paragraph.context = ctx;
    return true;
  }

  private parse_indentedcode(parent: Node, padding: number): Node | null {
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    const start = this.scanner.get_position();
    this.scanner.consume_line();
    const end = this.scanner.get_position();

    const icode = new Node(NODE_TAG.IndentedCode, { lines: [{ location: { row, column, start, end }, padding }] } as IndentedCodeContext);
    parent.push_node(icode);
    return icode;
  }

  private parse_fencedcode(parent: Node, offset: number): Node | null {
    const anchor = this.scanner.get_anchor();
    const bullet = this.scanner.peek;
    if (bullet != '~' && bullet != '`') {
      return null;
    }
    let length = 1;
    this.scanner.consume();

    while (this.scanner.consume_if(bullet)) {
      length += 1
    }

    if (length < 3) {
      this.scanner.set_anchor(anchor);
      return null;
    }

    // Skip the white spaces.
    this.scanner.skip_whitespace();

    const language_row = this.scanner.get_row();
    const language_column = this.scanner.get_column();
    const language_start = this.scanner.get_position();
    this.scanner.consume_line();
    const language_end = this.scanner.get_position();

    const fcode = new Node(NODE_TAG.FencedCode, { lines: [], bullet: bullet!, length, offset, language: { row: language_row, column: language_column, start: language_start, end: language_end } } as FencedCodeContext)
    parent.push_node(fcode);
    return fcode;
  }

  private parse_htmlblock(parent: Node): Node | null {
    return null;
  }

  private parse_link_reference_definition(parent: Node): Node | null {
    return null;
  }

  private parse_paragraph(parent: Node): Node | null {
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    const start = this.scanner.get_position();
    this.scanner.consume_line();
    const end = this.scanner.get_position();

    const p = new Node(NODE_TAG.Paragraph, { locations: [{ row, column, start, end }] } as ParagraphContext)
    parent.push_node(p);
    return p;
  }

  private continue_orderedlist(): boolean {
    return false;
  }

  private continue_unorderedlist(): boolean {
    return false;
  }

  private continue_listitem(self: Node): boolean {
    return false;
  }

  private continue_blockquote(): boolean {
    const anchor = this.scanner.get_anchor();
    const [indent, ok] = this.scanner.skip_whitespace();
    if (!ok) {
      return false;
    }

    if (indent > 3) {
      this.scanner.set_anchor(anchor);
      return false;
    }

    if (this.scanner.consume_if('>')) {
      return true;
    }
    return false;
  }

  private cotninue_indentedcode(self: Node): boolean {
    const anchor = this.scanner.get_anchor();
    const [indent, ok] = this.scanner.skip_whitespace();
    if (!ok) {
      return false;
    }

    if (indent < TAB_SIZE) {
      this.scanner.set_anchor(anchor);
      return false;
    }

    let padding = 0
    if (indent > TAB_SIZE) {
      padding = indent - TAB_SIZE;
    }

    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    const start = this.scanner.get_position();
    this.scanner.consume_line();
    const end = this.scanner.get_position();

    (self.context as IndentedCodeContext).lines.push({ location: { row, column, start, end }, padding });
    return true;
  }

  private continue_fencedcode(self: Node): boolean {
    const [indent, ok] = this.scanner.skip_whitespace();
    if (!ok) {
      return false;
    }

    // Check it is a close sequence.
    const ctx = self.context as FencedCodeContext;
    const bullet = ctx.bullet;
    let length = 0;
    while (this.scanner.consume_if(bullet!)) {
      length += 1
    }

    if (length >= ctx.length) {
      // The fenced code is close, we should close it. So we return false.
      return false;
    }

    // Otherwise, this line is a code.
    let padding = 0;
    if (indent > ctx.offset) {
      padding = indent - ctx.offset;
    }
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    const start = this.scanner.get_position();
    this.scanner.consume_line();
    const end = this.scanner.get_position();


    (self.context as FencedCodeContext).lines.push({ location: { row, column, start, end }, padding });
    return true;
  }

  private continue_htmlblock(self: Node): boolean {
    return false;
  }

  private continue_paragraph(self: Node): void {
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    const start = this.scanner.get_position();
    this.scanner.consume_line();
    const end = this.scanner.get_position();

    (self.context as ParagraphContext).locations.push({ row, column, start, end });
  }

  private is_continuation_paragraph(): boolean {
    let last_node = undefined;
    if (this.cached_nodes.length > 0) {
      last_node = this.cached_nodes[this.cached_nodes.length - 1];
    }
    return last_node != undefined && last_node.is(NODE_TAG.Paragraph);
  }

  private clear_cached_blocks(from: number, to: number): void {
    let index = to - 1;
    for (; index >= from; index--) {
      const node = this.cached_nodes.pop();

      if (node!.is(NODE_TAG.Paragraph)) {
        // transform the paragraph 
      }
    }
  }

  private is_blank_line(): boolean {
    const anchor = this.scanner.get_anchor();
    while (this.scanner.peek != '\r' && this.scanner.peek != '\n') {
      if (this.scanner.peek != ' ' && this.scanner.peek != '\t') {
        this.scanner.set_anchor(anchor);
        return false;
      }
    }
    this.scanner.consume_if('\n');
    return true;
  }

  private cached_nodes: Node[] = [];
}

