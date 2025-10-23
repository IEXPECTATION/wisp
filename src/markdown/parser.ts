import { Node, NODETAG } from "./node";
import { BlockQuoteProcessor, HeadingProcessor, ParagraphProcessor, Processor } from "./processor";
import { ArriveEndOfInput, Scanner } from "./scanner";

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
      const node = this.open_new_node();
      if (node == null) {
        this.scanner.skip_line()
        break;
      } else {
        if (this.scanner.has_skiped_lines()) {
          this.parse_skiped_lines();
          if(node.tag != this.current.tag) {
            this.close_nodes(this.root.get_last_node());
            this.current = this.root;
          }
        }
        this.current.push_node(node);
        this.current = node;
        if (node.is_left_block()) {
          break;
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
        this.current = this.root;
      }
    } else {
      if (matched != this.current && !this.scanner.has_skiped_lines()) {
        this.current = matched;
      }
    }
  }

  private parse_skiped_lines(): void {
    for (let p of this.fallback_processors) {
      const node = p.open(this.scanner)
      if (node == null) {
        continue;
      }
      this.current.push_node(node);
      break;
    }
    this.scanner.clear_skiped_lines();
  }

  private close_nodes(node: Node | null): void {
    if (!node?.element?.is_open() && node == null) {
      return;
    }

    node.element?.close();
    this.close_nodes(node.get_last_node());
  }

  private is_blank_line(scanner: Scanner): boolean {
    const line = scanner.peekline();
    for (let c of line) {
      if (c != ' ' && c != '\r' && c != '\n' && c != '\t') {
        return false;
      }
    }
    return true;
  }

  root: Node = new Node(NODETAG.Document);
  private current: Node = this.root;
  private processors: Processor[] = [new BlockQuoteProcessor(), new HeadingProcessor()];
  private fallback_processors: Processor[] = [new ParagraphProcessor()];
}
