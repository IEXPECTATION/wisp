export interface Block {
  is_open(): boolean;
  close(): void;
}

class BaseBlock implements Block {
  constructor() { }

  is_open(): boolean {
    return this.opened;
  }

  close(): void {
    this.opened = false;
  }

  private opened: boolean = true;
}

export class Document extends BaseBlock {
  constructor() {
    super()
  }
}

export class List extends BaseBlock {
  constructor(public readonly bullet: string) {
    super()
  }
}

export class ListItem extends BaseBlock {
  constructor(public readonly offset: number) {
    super()
  }
}

export class BlockQuote extends BaseBlock {
  constructor() {
    super()
  }
}

export class Heading extends BaseBlock {
  constructor() {
    super()
  }
}

export class IndentedCode extends BaseBlock {
  constructor() {
    super()
  }
}

export class FencedCode extends BaseBlock {
  constructor(public readonly offset: number, public readonly length: number, public readonly bullet: string) {
    super()
  }
}

export class HtmlBlocks extends BaseBlock {
  constructor() {
    super()
  }
}


export class LinkReferenceDefinition extends BaseBlock {
  constructor() {
    super()
  }
}

export class Paragraph extends BaseBlock {
  constructor() {
    super()
  }
}
