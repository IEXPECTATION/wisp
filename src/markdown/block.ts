export enum BlockTag {
	BlankLine,
	Heading,
	Hr,
	BlockQuote,
	IndentedCode,
	FencedCode,
	Reference,
	Paragraph,
	OrderedList,
	UnorderedList,
	ListItem,
};

export enum BlockKind {
	LeafBlock,
	ContainerBlock,
};

export class Block {
	constructor(tag: BlockTag, kind: BlockKind) {
		this.Tag = tag;
		this.Kind = kind;
	}

	Kind: BlockKind;
	Tag: BlockTag;
	Offset: number = 0;
};

export class LeafBlock extends Block {
	constructor(tag: BlockTag, content: string = "") {
		super(tag, BlockKind.LeafBlock);
		this.Content = content;
	}

	Content: string;
}

export class ContainerBlock extends Block {
	constructor(tag: BlockTag) {
		super(tag, BlockKind.ContainerBlock);
		this.Children = [];
	}

	static AppendBlock(container: ContainerBlock, block: Block) {
		container.Children.push(block);
	}

	Children: Block[];
}

export class BlankLineBlock extends LeafBlock {
	constructor() {
		super(BlockTag.BlankLine, "");
	}
}

export class HeadingBlock extends LeafBlock {
	constructor(level: number, content: string) {
		super(BlockTag.Heading, content);
		this.Level = level;
	}

	Level: number;
};

export class HrBlock extends LeafBlock {
	constructor() {
		super(BlockTag.Hr);
	}
};

export class IndentedCodeBlock extends LeafBlock {
	constructor(content: string = "") {
		super(BlockTag.IndentedCode, content);
	}
};

export class FencedCodeBlock extends LeafBlock {
	constructor(count: number, bullet: string, content: string = "") {
		super(BlockTag.FencedCode, content);
		this.Bullet = bullet;
		this.Count = count;
	}

	Closed: boolean = false;
	Bullet: string;
	Count: number;
};

export class ReferenceBlock extends LeafBlock {
	constructor() {
		super(BlockTag.Reference);
	}
};

export class ParagraphBlock extends LeafBlock {
	constructor(content: string = "") {
		super(BlockTag.Paragraph, content);
	}
};

export class BlockQuoteBlock extends ContainerBlock {
	constructor() {
		super(BlockTag.BlockQuote);
	}
}

export class OrderedListBlock extends ContainerBlock {
	constructor() {
		super(BlockTag.OrderedList);
	}
}

export class UnorderedListBlock extends ContainerBlock {
	constructor() {
		super(BlockTag.UnorderedList);
	}
}