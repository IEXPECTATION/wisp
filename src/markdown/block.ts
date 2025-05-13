
export class Block {
	Offset: number = 0;
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
	constructor(length: number, bullet: string, offset: number, language: string, content: string = "") {
		super(content);
		this.Bullet = bullet;
		this.Length = length;
		this.Offset = offset;
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
	constructor(content: string = "") {
		super(content);
	}
};

// Container Blocks
export class ContainerBlock extends Block {
	constructor(parent: ContainerBlock | null) {
		super();
		this.Parent = parent;
	}

	Parent: ContainerBlock | null;
	Blocks: Block[] = [];
};

export class DocumentBlock extends ContainerBlock {
	constructor() {
		super(null);
	}
}

export class BlockQuoteBlock extends ContainerBlock {
	constructor(parent: ContainerBlock, nested: number) {
		super(parent);
		this.Nested = nested;
	}

	Nested: number;
};

export class OrderedListBlock extends ContainerBlock {
	constructor(parent: ContainerBlock, startNumber: number) {
		super(parent);
		this.StartNumber = startNumber;
	}

	StartNumber: number;
};

export class UnorderedListBlock extends ContainerBlock {
	constructor(parent: ContainerBlock, bullet: string) {
		super(parent);
		this.Bullet = bullet;
	}

	Bullet: string;
};

export class ListItemBlock extends ContainerBlock {
	constructor(parent: ContainerBlock) {
		super(parent);
	}

	Loose: boolean = false
}