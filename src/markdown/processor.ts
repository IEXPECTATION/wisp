import { Block, BlockQuote, FencedCode, Heading, IndentedCode, Paragraph } from "./block";
import { Node, NODE_TAG } from "./node";
import { Scanner } from "./scanner";

export interface Processor {
  open(scanner: Scanner): Node | null;
  match(block: Block, scanner: Scanner): boolean;
  can_interrupt_paragraph(): boolean;
  can_accept_indented_line(): boolean;
}

export class ListProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    const line = scanner.peekline();
    if (line[0] == '-' || line[0] == '+' || line[0] == '*') {
      const bullet = line[0];
      // unordered list
      return null;
    } else if (line[0] >= '1' && line[0] <= '9') {
      // ordered list
      return null;
    } else {
      return null;
    }
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }

  can_interrupt_paragraph(): boolean {
    return true;
  }

  can_accept_indented_line(): boolean {
    return false;
  }
}

export class ListItemProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    throw new Error("Method not implemented.");
  }

  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }

  can_interrupt_paragraph(): boolean {
    return true;
  }

  can_accept_indented_line(): boolean {
    return false;
  }
}

export class BlockQuoteProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    const ok = this.parse(scanner);
    if (!ok) {
      return null;
    }

    const bq = new BlockQuote();
    return new Node(NODE_TAG.BlockQuote, bq, this);
  }

  match(_block: Block, scanner: Scanner): boolean {
    return this.parse(scanner);
  }

  can_interrupt_paragraph(): boolean {
    return true;
  }

  can_accept_indented_line(): boolean {
    return false;
  }

  private parse(scanner: Scanner): boolean {
    const line = scanner.peekline();
    if (line[0] != '>') {
      return false;
    }
    scanner.consume();

    if (line[1] == ' ') {
      scanner.consume();
    }
    return true;
  }
}

export class ThematicBreakProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
  can_interrupt_paragraph(): boolean {
    throw new Error("Method not implemented.");
  }
  can_accept_indented_line(): boolean {
    throw new Error("Method not implemented.");
  }

}

export class HeadingProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    const line = scanner.peekline();
    let i = 0;
    let level = 0;

    while (i < line.length) {
      if (level > 6) {
        return null;
      }

      if (line[i] == '#') {
        level += 1;
      } else {
        break;
      }

      i += 1;
    }

    if (level == 0 || line[i] != ' ') {
      return null;
    }
    i += 1;

    scanner.consume(line.length);
    const content = line.substring(i).trimEnd();
    const heading = new Heading(level, content);
    heading.close();
    return new Node(NODE_TAG.Heading, heading, this);
  }

  match(_block: Block, _scanner: Scanner): boolean {
    return false;
  }

  can_interrupt_paragraph(): boolean {
    return true;
  }

  can_accept_indented_line(): boolean {
    return false;
  }

}

export class IndentedCodeProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    const indent = scanner.get_indent();
    let pandding = indent - 4;
    const line = scanner.peekline();
    const indented_code = new IndentedCode(' '.repeat(pandding) + line);
    scanner.consume(line.length);
    return new Node(NODE_TAG.IndentedCode, indented_code, this);
  }

  match(block: Block, scanner: Scanner): boolean {
    const indent = scanner.get_indent();

    if (indent >= 4) {
      let pandding = indent - 4;
      const line = scanner.peekline();
      (block as IndentedCode).content += ' '.repeat(pandding) + line;
      scanner.consume(line.length);
      return true;
    } else {
      block.close();
      return false;
    }
  }

  can_interrupt_paragraph(): boolean {
    return false;
  }

  can_accept_indented_line(): boolean {
    return true;
  }
}

export class FencedCodeProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    const indent = scanner.get_indent();
    const result = this.parse(scanner, "");
    if (result == null) {
      return null;
    }

    const fc = new FencedCode(indent, result.length, result.bullet, result.language);
    return new Node(NODE_TAG.FencedCode, fc, this);
  }

  match(block: Block, scanner: Scanner): boolean {
    const result = this.parse(scanner, (block as FencedCode).bullet);
    if (result == null) {
      this.append_line(block, scanner);
      return true;
    }

    if ((block as FencedCode).length <= result.length) {
      block.close();
    } else {
      this.append_line(block, scanner);
    }
    return true;
  }

  can_interrupt_paragraph(): boolean {
    return true;
  }

  can_accept_indented_line(): boolean {
    return false;
  }

  private parse(scanner: Scanner, bullet: string): { bullet: string, length: number, language: string } | null {
    const line = scanner.peekline();
    let length = 0;
    let language = "";
    for (let c of line) {
      if (c == '~' || c == '`') {
        if (bullet == "") {
          c = bullet;
        }

        if (c == bullet) {
          length += 1;
        } else {
          break;
        }
      } else {
        break;
      }
      scanner.consume();
    }

    if (length < 3) {
      return null;
    }
    return { bullet, length, language };
  }

  private append_line(block: Block, scanner: Scanner) {
    let indent = (block as FencedCode).offset;
    const line = scanner.peekline();
    let i = 0;
    for (i = 0; i < line.length && indent > 0; i++) {
      if (line[i] != ' ') {
        break;
      }
      i += 1;
      indent -= 1;
    }

    (block as FencedCode).content += line.substring(i);
    scanner.consume(line.length);
  }
}

export class HtmlBlockProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    throw new Error("Method not implemented.");
  }

  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }

  can_interrupt_paragraph(): boolean {
    return true;
  }

  can_accept_indented_line(): boolean {
    return false;
  }
}

// export class LinkReferenceDefinitionProcessor implements Processor {
//   open(scanner: Scanner): Node | null {
//     throw new Error("Method not implemented.");
//   }
//   match(block: Block, scanner: Scanner): boolean {
//     throw new Error("Method not implemented.");
//   }
//
//   can_interrupt_paragraph(): boolean {
//   }
// }

export class ParagraphProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    const para = new Paragraph(scanner.peekline());
    return new Node(NODE_TAG.Paragraph, para, this);
  }

  match(block: Block, scanner: Scanner): boolean {
    if (scanner.is_bank_line()) {
      block.close();
      scanner.consume(scanner.peekline().length);
      return true;
    }
    return false;
  }

  can_interrupt_paragraph(): boolean {
    return false;
  }

  can_accept_indented_line(): boolean {
    return false;
  }
}
