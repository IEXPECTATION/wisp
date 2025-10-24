import { Node, NODETAG } from "./node";
import { BlockQuoteProcessor, HeadingProcessor, ParagraphProcessor, Processor } from "./processor";
import { ArriveEndOfInput, Scanner } from "./scanner";

type IndentInfo = {
  indent: number,
  column: number
};

export class Parser {
  constructor(private readonly scanner: Scanner) { }

  parse(): Error | null {
    while (true) {
      let err = this.open_new_nodes()
      if (err != null) {
        if (err == ArriveEndOfInput) {
          if (this.scanner.has_skiped_lines()) {
            this.parse_skiped_lines()
          }
          this.close_nodes(this.root.get_last_node());
          break;
        } else {
          return err;
        }
      }
      this.match_opened_blocks()
    }
    return null;
  }

  private open_new_nodes(): Error | null {
    while (true) {
      const indent_info = this.get_indent();
      if (this.is_blank_line() && this.scanner.has_skiped_lines()) {
        this.parse_skiped_lines();
        break;
      } else if (indent_info != null && indent_info.indent >= 4 && !this.scanner.has_skiped_lines()) {
        // TODO: Check this line whether starts with 4 space or a tab.
        // The parsing will be prevented, If there is skiped linse.
      } else {
        const node = this.open_new_node();
        if (node == null) {
          this.scanner.skip_line()
          break;
        } else {
          if (this.scanner.has_skiped_lines()) {
            this.parse_skiped_lines();
            if (node.tag != this.container.tag) {
              this.close_nodes(this.root.get_last_node());
              this.container = this.root;
            }
          }
          this.container.push_node(node);
          if (node.is_left_block()) {
            break;
          }
          this.container = node;
        }
      }
    }

    const err = this.scanner.readline();
    if (err != null) {
      return err;
    }
    return null;
  }

  private open_new_node(): Node | null {
    for (let p of this.processors) {
      const node = p.open(this.scanner);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  private match_opened_blocks(): void {
    let matched = this.root;
    while (matched.has_children()) {
      if (!matched.is_last_element_opened()) {
        break;
      }

      const child = matched.get_last_node()!;
      let ok = child.process!.match(child.element!, this.scanner);
      if (!ok) {
        break;
      }
      matched = child;
    }

    if (matched == this.root) {
      // This line may be a lazy paragraph.
      if (!this.scanner.has_skiped_lines()) {
        // Close this node and all parent nodes of it.
        this.close_nodes(this.root.get_last_node());
        this.container = this.root;
      }
    } else {
      if (matched != this.container && !this.scanner.has_skiped_lines()) {
        this.container = matched;
      }
    }
  }

  private parse_skiped_lines(): void {
    for (let p of this.fallback_processors) {
      const node = p.open(this.scanner)
      if (node == null) {
        continue;
      }
      this.container.push_node(node);
      break;
    }
    this.scanner.clear_skiped_lines();
  }

  private close_nodes(node: Node | null): void {
    if (node == null || !node?.element?.is_open()) {
      return;
    }

    node.element?.close();
    this.close_nodes(node.get_last_node());
  }

  private is_blank_line(): boolean {
    const line = this.scanner.peekline();
    for (let c of line) {
      if (c != ' ' && c != '\r' && c != '\n' && c != '\t') {
        return false;
      }
    }
    return true;
  }

  private get_indent(): IndentInfo | null {
    const line = this.scanner.peekline();
    if (line[0] == '\t') {
      return { indent: 4, column: 1 };
    } else {
      let indent = 0;
      for(let c of line) {
        if(c == ' ') {
          indent += 1;
        }
      }

      if(indent != 0) {
        return {indent, column: indent};
      } else {
        return null;
      }
    }
  }

  root: Node = new Node(NODETAG.Document);
  private container: Node = this.root;
  private processors: Processor[] = [new BlockQuoteProcessor(), new HeadingProcessor()];
  private fallback_processors: Processor[] = [new ParagraphProcessor()];
}
