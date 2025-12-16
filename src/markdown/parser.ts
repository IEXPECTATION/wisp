import { Node, NODE_TAG } from "./node";
import { Scanner, TAB_SIZE } from "./scanner";

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

  parse_block(root: Node): Error | null {
    let parent = root;
    while (true) {
      // Firstly, we try to open a new block.
      const node = this.try_open_block(parent);

      if (node == null) {
        return new Error("Cound not open new block.");
      }

      // Push this node to our cache.
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


    const is_continuation_paragraph = this.is_continuation_paragraph();

    // Continue to parse the next line.
    for(let node of this.cached_nodes) {
      // parse the multiple line block
      switch(node.tag) {
        case NODE_TAG.List:
          break;
        case NODE_TAG.ListItem:
          break;
        case NODE_TAG.BlockQuote:
          break;
        case NODE_TAG.IndentedCode:
          break;
        case NODE_TAG.FencedCode:
          break;
        case NODE_TAG.HtmlBlock:
          break;
        default:
          break;
      }

      // if there are not any node parsed 
      if(is_continuation_paragraph) {

      }
    }
    return null;
  }


  try_open_block(parent: Node): Node | null {
    const [indent, ok] = this.scanner.skip_whitespace();
    if (!ok) {
      return null;
    }

    const is_continuation_paragraph = this.is_continuation_paragraph();
    if (!is_continuation_paragraph && indent >= TAB_SIZE) {
      // indented code
      return this.parse_indentedcode(parent);
    }

    // console.log(this.scanner.peek);
    switch (this.scanner.peek) {
      case '*':
      case '-': {
        // unordered list or thematic break
        let node = this.parse_thematicbreak(parent);
        if (node != null) {
          return node;
        }

        return null;
      }
      case '_':
        // thematic break
        return this.parse_thematicbreak(parent);
      case '+': {
        // unordered list
      }
        break;
      case '>':
        // blockquote
        return this.parse_blockquote(parent);
      case '#':
        // heading
        return this.parse_heading(parent);
      case '~':
      case '`': {
        // fenced code
      }
      case '<': {
        // html block
      }
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
      }
      default:
        // TODO: do nothing or parse paragraph?
        break;
    }

    // fallback to paragraph
    if(is_continuation_paragraph) {
      // We skip this line and let it to be parsed by parse_block.
      return null;
    }

    // parse the paragraph
    
    return null;
  }

  parse_list(): Node | null {
    return null;
  }

  parse_blockquote(parent: Node): Node | null {
    const start = this.scanner.get_position();
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    this.scanner.consume();
    this.scanner.consume_if(' ');
    const end = this.scanner.get_position();

    const bq = new Node(NODE_TAG.BlockQuote, { row, column, start, end });
    parent.push_node(bq);
    return bq;
  }

  parse_thematicbreak(parent: Node): Node | null {
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
      // Back to the start.
      this.scanner.set_postion(start);
      return null;
    }
    const end = this.scanner.get_position();

    const tb = new Node(NODE_TAG.ThematicBreak, { row, column, start, end });
    parent.push_node(tb);
    return tb;
  }

  parse_heading(parent: Node): Node | null {
    let level = 1;
    this.scanner.consume();
    while (this.scanner.consume_if('#') && level <= 6) {
      level += 1;
    }

    if (this.scanner.peek != ' ') {
      return null;
    }
    this.scanner.consume();

    const start = this.scanner.get_position();
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    this.scanner.consume_line();
    const end = this.scanner.get_position();
    const h = new Node(NODE_TAG.Heading, { row, column, start, end }, { level });
    parent.push_node(h);
    return h;
  }

  parse_indentedcode(parent: Node): Node | null {
    return null;
  }

  parse_fencedcode(parent: Node): Node | null {
    return null;
  }

  private is_continuation_paragraph(): boolean {
    let last_node = undefined;
    if (this.cached_nodes.length > 0) {
      last_node = this.cached_nodes[this.cached_nodes.length - 1];
    }
    return last_node != undefined && last_node.is(NODE_TAG.Paragraph);
  }

  private cached_nodes: Node[] = [];
}

const s = new Scanner(">>  * * *");
const p = new Parser(s);
const d = p.parse();
console.dir(d, { depth: Infinity });
