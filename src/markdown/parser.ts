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

  private parse_block(root: Node): Error | null {
    let parent = root;
    for (; ;) {
      for (; ;) {
        // Firstly, we try to open a new block.
        const node = this.try_open_block(parent);

        if (node == null) {
          return null;
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

      // Continue to parse the next line.
      for (; ;) {
        if(this.scanner.is_eof()) {
          return null;
        }

        // parse the multiple line block
        if (this.cached_nodes.length == 0) {
          break;
        }

        let index = 0;
        let matched = true;
        while (index < this.cached_nodes.length) {
          switch (this.cached_nodes[index].tag) {
            case NODE_TAG.List:
              break;
            case NODE_TAG.ListItem:
              break;
            case NODE_TAG.BlockQuote:
              if(!this.continue_blockquote()) {
                matched = false;
              }
              break;
            case NODE_TAG.IndentedCode:
              if(!this.cotninue_indentedcode(this.cached_nodes[index])) {
                matched = false;
              }
              break;
            case NODE_TAG.FencedCode:
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

        const last_node = this.cached_nodes[this.cached_nodes.length - 1];
        if (index == this.cached_nodes.length && last_node.is_left_block() && !last_node.is(NODE_TAG.Paragraph)) {
          // multiple line leaf block, like indented code and fenced code
          continue;
        }

        // close all blocks from index to the last one.
        this.clear_cached_blocks(index, this.cached_nodes.length);
        if(index == 0 && !matched) {
          parent = root;     
        } else {
          parent = this.cached_nodes[index > 0 ? index - 1 : index];
        }
        break;
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
      return this.parse_indentedcode(parent);
    }

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
      }
      default:
        // TODO: do nothing or parse paragraph?
        break;
    }

    // fallback to paragraph
    if (is_continuation_paragraph) {
      return null;
    } else {
      // parse the paragraph
      // create a new paragraph node
    }

    return null;
  }

  private parse_unorderedlist(): Node | null {
    return null;
  }

  private parse_orderedlist(): Node | null {
    return null;
  }

  private parse_listitem(): Node | null {
    return null;
  }

  private parse_blockquote(parent: Node): Node | null {
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

  private parse_thematicbreak(parent: Node): Node | null {
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

  private parse_heading(parent: Node): Node | null {
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

  private parse_indentedcode(parent: Node): Node | null {
    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    const start = this.scanner.get_position();
    this.scanner.consume_line();
    const end = this.scanner.get_position();

    const icode = new Node(NODE_TAG.IndentedCode, { row, column, start, end });
    parent.push_node(icode);
    return icode;
  }

  private parse_fencedcode(parent: Node): Node | null {
    return null;
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
    const origin = this.scanner.get_position();
    const [indent, ok] = this.scanner.skip_whitespace();
    if(!ok) {
      return false;
    }
    
    if(indent > 3) {
      this.scanner.set_postion(origin);
      return false;
    }

    if(this.scanner.consume_if('>')) {
      return true;
    }
    return false;
  }

  private cotninue_indentedcode(self: Node): boolean {
    const origin = this.scanner.get_position();
    const [indent, ok] = this.scanner.skip_whitespace();
    if(!ok) {
      return false;
    }
    
    if(indent < TAB_SIZE) {
      this.scanner.set_postion(origin);
      return false;
    }

    let padding = 0
    if(indent > TAB_SIZE) {
      padding = indent - TAB_SIZE; 
    }

    const row = this.scanner.get_row();
    const column = this.scanner.get_column();
    const start = this.scanner.get_position();
    this.scanner.consume_line();
    const end = this.scanner.get_position();
     

    return false;
  }

  private continue_fencedcode(self: Node): boolean {
    return false;
  }

  private continue_htmlblock(self: Node): boolean {
    return false;
  }

  private continue_paragraph(self: Node): boolean {
    return false;
  }

  private is_continuation_paragraph(): boolean {
    let last_node = undefined;
    if (this.cached_nodes.length > 0) {
      last_node = this.cached_nodes[this.cached_nodes.length - 1];
    }
    return last_node != undefined && last_node.is(NODE_TAG.Paragraph);
  }

  private clear_cached_blocks(from: number, to: number): void {

  }

  private cached_nodes: Node[] = [];
}

const s = new Scanner("> # abc\n> ## bcd");
const p = new Parser(s);
console.dir(p.parse(), { depth: Infinity });
