import { Block, BlockQuote, Heading, Paragraph } from "./block";
import {  Node, NODETAG } from "./node";
import { ArriveEndOfInput, Scanner } from "./scanner";

export interface Processor {
  open(scanner: Scanner): Node | null;
  match(block: Block, scanner: Scanner): boolean;
}

export class ListProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class ListItemProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    throw new Error("Method not implemented.");
  }

  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class BlockQuoteProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    const ok = this.parse(scanner);
    if(!ok) {
      return null;
    }

    const bq = new BlockQuote();
    return new Node(NODETAG.BlockQuote, bq, this);
  }

  match(_block: Block, scanner: Scanner): boolean {
    return this.parse(scanner);
  }

  private parse(scanner: Scanner): boolean {
    const line = scanner.peekline();
    if(line[0] != '>') {
      return false;
    } 
    scanner.consume();
    
    if(line[1] == ' ') {
      scanner.consume();
    }
    return true;
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
        return new Node(NODETAG.Heading, heading, this);
    }

    match(_block: Block, _scanner: Scanner): boolean {
        return false;
    }
}


export class IndentedCodeProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    const begin = scanner.get_position();



    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class FencedCodeProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class HtmlBlockProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class LinkReferenceDefinitionProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class ParagraphProcessor implements Processor {
  open(scanner: Scanner): Node | null {
    const skiped_lines = scanner.get_skiped_lines();

    const para = new Paragraph(skiped_lines);
    scanner.clear_skiped_lines();
    para.close();
    return new Node(NODETAG.Paragraph, para, this);
  }

  match(_block: Block, _scanner: Scanner): boolean {
    return false;
  }

}
