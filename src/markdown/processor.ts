import { Block, BlockQuote, Heading } from "./block";
import { ArriveEndOfInput, Scanner } from "./scanner";

export interface Processor {
  open(scanner: Scanner): Block | null;
  match(block: Block, scanner: Scanner): boolean;
}

export class ListProcessor implements Processor {
  open(scanner: Scanner): Block | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class ListItemProcessor implements Processor {
  open(scanner: Scanner): Block | null {
    throw new Error("Method not implemented.");
  }

  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class BlockQuoteProcessor implements Processor {
  open(scanner: Scanner): Block | null {
    return null;
  }

  match(_block: Block, scanner: Scanner): boolean {
    return this.parse(scanner);
  }

  private parse(scanner: Scanner): boolean {
    return false;
  }
}


export class HeadingProcessor implements Processor {
  open(scanner: Scanner): Block | null {
    const line = scanner.peekline();
    let i = 0;
    let level = 0;

    while(i < line.length) {
      if(level > 6) {
        return null;
      }

      if(line[i] == '#') {
        level += 1;
      } else {
        break;
      }
      
      i += 0
    }
   
    if(line[i] != ' ') {
      return null;
    }
    i += 1;

    if(i >= line.length) {
      return null;
    }

    const content = line.substring(i);
    const heading = new Heading(level, content);
    
    
  }

  match(_block: Block, _scanner: Scanner): boolean {
    return false;
  }
}

export class IndentedCodeProcessor implements Processor {
  open(scanner: Scanner): Block | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class FencedCodeProcessor implements Processor {
  open(scanner: Scanner): Block | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class HtmlBlockProcessor implements Processor {
  open(scanner: Scanner): Block | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class LinkReferenceDefinitionProcessor implements Processor {
  open(scanner: Scanner): Block | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}

export class ParagraphProcessor implements Processor {
  open(scanner: Scanner): Block | null {
    throw new Error("Method not implemented.");
  }
  match(block: Block, scanner: Scanner): boolean {
    throw new Error("Method not implemented.");
  }
}
