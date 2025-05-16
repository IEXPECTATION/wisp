
export class Block {
	Indent: number = 0;
};

// Leaf Blocks
export class LeafBlock extends Block {
	constructor(content: string) {
		super();
		this.Content = content;
	}

	Content: string;
};

export class BlankLineBlock extends LeafBlock {
	constructor() {
		super("");
	}
};

export class HeadingBlock extends LeafBlock {
	constructor(level: number, content: string) {
		super(content);
		this.Level = level;
	}

	Level: number;
};

export class HrBlock extends LeafBlock {
	constructor() {
		super("");
	}
};

export class IndentedCodeBlock extends LeafBlock {
	constructor(content: string = "") {
		super(content);
	}
};

export class FencedCodeBlock extends LeafBlock {
	constructor(length: number, bullet: string, language: string, content: string = "") {
		super(content);
		this.Bullet = bullet;
		this.Length = length;
		this.Language = language;
	}

	Closed: boolean = false;
	Bullet: string;
	Length: number;
	Language: string;
};

export class ReferenceBlock extends LeafBlock {
	constructor() {
		super("");
	}
};

export class ParagraphBlock extends LeafBlock {
	constructor(parent: ContainerBlock, content: string = "") {
		super(content);
		this.Parent = parent;
	}

	Parent: ContainerBlock;
};

// Container Blocks
export class ContainerBlock extends Block {
	constructor() {
		super();
	}

	Last(): Block | undefined {
		if (this.Blocks.length > 0) {
			return this.Blocks[this.Blocks.length - 1];
		}
		return undefined;
	}

	Append(child: Block) {
		this.Blocks.push(child);
	}

	Blocks: Block[] = [];
};

export class DocumentBlock extends ContainerBlock {
	constructor() {
		super();
	}
}

export class BlockQuoteBlock extends ContainerBlock {
	constructor() {
		super();
	}
};

export class OrderedListBlock extends ContainerBlock {
	constructor(startNumber: number) {
		super();
		this.StartNumber = startNumber;
	}

	StartNumber: number;
};

export class UnorderedListBlock extends ContainerBlock {
	constructor(bullet: string) {
		super();
		this.Bullet = bullet;
	}

	Bullet: string;
};

export class ListItemBlock extends ContainerBlock {
	constructor() {
		super();
	}

	Loose: boolean = false
}