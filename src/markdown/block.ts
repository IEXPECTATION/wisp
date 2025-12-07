export interface Block {
  is_open(): boolean;
  close(): void;
}

export class BaseBlock implements Block {
  is_open(): boolean {
    return this.opened;
  }

  close(): void {
    this.opened = false;
  }

  private opened: boolean = true;
}

export class List extends BaseBlock {
  constructor(public readonly sign: string | number) {
    super();
  }
}

export class ListItem extends BaseBlock {
  constructor(public readonly offset: number) {
    super();
  }
}

export class BlockQuote extends BaseBlock {
  constructor() {
    super();
  }
}

export class ThematicBreak extends BaseBlock {
  constructor() {
    super();
  }
}

export class Heading extends BaseBlock {
  constructor(public readonly level: number, public readonly content: string) {
    super();
  }
}

export class IndentedCode extends BaseBlock {
  constructor(public content: string) {
    super();
  }
}

export class FencedCode extends BaseBlock {
  constructor(public readonly offset: number, public readonly length: number, public readonly bullet: string, public readonly language: string) {
    super();
  }

  content: string = "";
}

export class HtmlBlock extends BaseBlock {
  constructor() {
    super();
  }
}

export class LinkReferenceDefinition extends BaseBlock {
  constructor() {
    super();
  }
}

export class Paragraph extends BaseBlock {
  constructor(public content: string) {
    super();
  }
}


