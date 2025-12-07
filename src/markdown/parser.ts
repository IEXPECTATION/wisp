import { Node, NODETAG } from "./node";
import { BlockQuoteProcessor, FencedCodeProcessor, HeadingProcessor, IndentedCodeProcessor, ParagraphProcessor, Processor } from "./processor";
import { ArriveEndOfInput, Scanner } from "./scanner";
import { Paragraph } from "./block";
import { match } from "assert";

export class Parser {
  constructor(private readonly scanner: Scanner) { }

  parse(): Node | Error {
    let err = undefined;
    while (true) {
      err = this.open_new_nodes()
      if (err != null) {
        break;
      }
      err = this.match_opened_blocks()
      if (err != null) {
        break;
      }
    }

    if (err == ArriveEndOfInput) {
      this.close_nodes(this.root.get_last_node());
      return this.root;
    } else {
      return err;
    }
  }

  private open_new_nodes(): Error | null {
    while (true) {
      const node = this.open_new_node();
      if (node == null) {
        if (!this.maybe_lazy) {
          return new Error("No nodes are opened.");
        }
        console.assert(this.current.get_last_node()?.element?.is_open(), "Try to modity an closed block.");
        const par = this.current.get_last_node()?.element as Paragraph;
        par.content += this.scanner.peekline();
        break;
      } else {
        if (this.maybe_lazy) {
          this.close_nodes(this.current.get_last_node());
          this.maybe_lazy = false;
        }

        console.assert(!this.current.is_left_block(), "Try to push a node to a leaf block.");
        this.current.push_node(node);
        if (node.is_left_block()) {
          if (node.tag == NODETAG.Paragraph) {
            this.maybe_lazy = true;
          }
          break;
        }
        this.current = node;
      }
    }

    const err = this.scanner.readline();
    if (err != null) {
      return err;
    }
    return null;
  }

  private open_new_node(): Node | null {
    // Figure out the indent of this line.
    this.scanner.skip_whitesoace();
    const indent = this.scanner.get_indent();
    for (let p of this.processors) {
      if (this.maybe_lazy && !p.can_interrupt_paragraph()) {
        continue;
      }

      if (p.can_accept_indented_line() && (indent < 4 || this.maybe_lazy)) {
        continue;
      }

      const node = p.open(this.scanner);
      if (node != null) {
        return node;
      }
    }
    return null;
  }

  private match_opened_blocks(): Error | null {
    let matched = this.root;
    let goon = true;
    while (goon) {
      matched = this.root;
      while (matched.has_children()) {
        console.log("wuch: 0");
        console.dir(matched.tag);
        if (!matched.is_last_element_opened()) {
          console.log("wuch: 1");
          console.dir(matched.tag);
          goon = false;
          break;
        }

        this.scanner.skip_whitesoace();
        const child = matched.get_last_node()!;
        let ok = child.process!.match(child.element!, this.scanner);
        if (!ok) {
          console.log("wuch: 2");
          goon = false;
          break;
        }

        if (child.is_left_block()) {
          const err = this.scanner.readline();
          if (err != null) {
            return err;
          }

          if (this.maybe_lazy && child.tag == NODETAG.Paragraph && !child.element?.is_open()) {
            this.maybe_lazy = false;
          }
          console.log("wuch: 3");
          console.dir(matched.tag);
          break;
        } else {
          matched = child;
        }
      }
    }
    this.current = matched;
    return null;
  }

  private close_nodes(node: Node | null): void {
    if (node == null || !node?.element?.is_open()) {
      return;
    }

    node.element?.close();
    this.close_nodes(node.get_last_node());
  }

  // Indicates that is parsing the paragraph and checks the next line is a continuation paragraph or not.
  private maybe_lazy: boolean = false;
  private root: Node = new Node(NODETAG.Document);
  private current: Node = this.root;
  private processors: Processor[] = [new BlockQuoteProcessor(), new HeadingProcessor(), new IndentedCodeProcessor(), new FencedCodeProcessor(), new ParagraphProcessor()];
}
