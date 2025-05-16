import { BlankLineBlock, BlockQuoteBlock, ContainerBlock, DocumentBlock, FencedCodeBlock, HeadingBlock, HrBlock, IndentedCodeBlock, ListItemBlock, OrderedListBlock, ParagraphBlock, UnorderedListBlock } from "./blocks";

class Context {
	constructor(input: string) {
		this.input = input;
	}

	Done(): boolean {
		return this.position == this.input.length;
	}

	ReadLine(): void {
		this.Row += 1;
		this.Column = 0;
		this.Buffer = "";
		console.assert(this.Indent == 0);

		let eol = "";
		while (this.position < this.input.length) {
			let c = this.input[this.position];
			if (Context.IsEOL(c)) {
				this.Buffer += c;
				this.position += 1;
				c = this.input[this.position];
				if (eol != c && Context.IsEOL(c)) {
					this.Buffer += c;
				}
				return;
			}
			this.position += 1;
			this.Buffer += c;
		}
	}

	Peek(position: number): string | undefined {
		if (position < this.Buffer.length) {
			return this.Buffer[position];
		}
		return undefined;
	}

	SkipWhiteSpace(column: number): number {
		while (column < this.Buffer.length) {
			let c = this.Peek(column);
			if (c && !Context.IsWhiteSpace(c)) {
				break;
			}
			column += 1;
		}

		this.Column = column;
		return column;
	}

	static IsEOL(c: string) {
		return c == '\n' || c == '\r';
	}

	static IsWhiteSpace(c: string) {
		return c == ' ' || c == '\t';
	}

	Buffer: string = "";
	Root: ContainerBlock = new DocumentBlock();
	Container: ContainerBlock = this.Root;
	Paragragh: ParagraphBlock | null = null;
	Indent: number = 0;
	Column: number = 0;
	Row: number = 0;
	BlankLine: boolean = false;

	private input: string;
	private position: number = 0;
}

export class Parser {
	static TAB_SIZE: number = 4;

	static ParseInline(root: ContainerBlock): void {
		// TODO:
	}

	static ParseBlock(input: string): ContainerBlock {
		const context = new Context(input);

		while (!context.Done()) {
			context.ReadLine();
			this.parseContainerBlock(context);
			this.parseLeafBlock(context);
		}

		return context.Root;
	}

	private static parseIndent(context: Context): void {
		let indent = context.Indent;
		let column = context.Column;
		let tabSize = Parser.TAB_SIZE;
		let finished = false;

		while (!finished && column < context.Buffer.length) {
			let c = context.Buffer[column];
			switch (c) {
				case ' ': {
					indent += 1;
					tabSize -= 1;
					if (tabSize == 0) {
						tabSize = Parser.TAB_SIZE;
					}
				}
					break;
				case '\t': {
					indent += tabSize;
					tabSize = Parser.TAB_SIZE;
				}
					break;
				default:
					finished = true;
					break;
			}
			if (!finished) {
				column += 1;
			}
		}

		context.Column = column;
		context.Indent = indent;
	}

	private static parseContainerBlock(context: Context): void {
		context.Container = context.Root;
		this.parseIndent(context);

		while (true) {
			if (this.parseBlockQuote(context)) {
				continue;
			}

			if (this.parseUnorderedList(context)) {
				continue;
			}

			if (this.parseOrderedList(context)) {
				continue;
			}

			break;
		}
	}

	private static parseBlockQuote(context: Context): boolean {
		if (context.Indent > this.TAB_SIZE) {
			return false;
		}

		let column = context.Column;
		let firstBlockQuote = null;
		let matched = false;
		while (context.Peek(column) == '>') {
			matched = true;
			const block = context.Container.Last();
			if (block instanceof BlockQuoteBlock) {
				context.Container = block
			} else {
				let bq = new BlockQuoteBlock()
				context.Container.Append(bq);
				context.Container = bq;
				if (firstBlockQuote == null) {
					firstBlockQuote = bq;
				}
			}
			column += 1;
		}

		if (!matched) {
			return false;
		}

		let c = context.Peek(column);
		if (c == ' ') {
			column += 1;
		} else if (c == '\t') {
			context.Indent = Parser.TAB_SIZE - (column % Parser.TAB_SIZE);
			column += 1;
		} else {
			// Do nothing
		}

		if (firstBlockQuote != null) {
			firstBlockQuote.Indent = context.Indent;
		}
		context.Column = column;
		context.Indent = 0;
		return true;
	}

	private static parseUnorderedList(context: Context): boolean {
		if (context.Indent >= Parser.TAB_SIZE) {
			return false;
		}

		const c = context.Peek(context.Column);
		if (c != '+' && c != '*' && c != '-') {
			return false;
		}
		const block = context.Container.Last();
		if (block && block instanceof UnorderedListBlock) {
			context.Container = block;
		} else {
			let unorderListBlock = new UnorderedListBlock(c);
			context.Container.Append(unorderListBlock);
			context.Container = unorderListBlock;
			unorderListBlock.Indent = context.Indent;
		}
		context.Column += 1;
		context.Indent = 0;
		return true;
	}

	private static parseOrderedList(context: Context): boolean {
		if (context.Indent >= Parser.TAB_SIZE) {
			return false;
		}

		// TODO: Recognize the list is 'OrderedList' or not.
		// const block = context.Container.Last();
		// if (block && block instanceof UnorderedListBlock) {
		// 	context.Container = block;
		// } else {
		// 	let unorderListBlock = new UnorderedListBlock(c);
		// 	context.Container.Append(unorderListBlock);
		// 	context.Container = unorderListBlock;
		// 	unorderListBlock.Indent = context.Indent;
		// }
		// context.Indent = 0;
		// return true;
		return false;
	}

	private static parseListItem(context: Context): boolean {
		const block = context.Container.Last();
		if(block instanceof UnorderedListBlock || block instanceof OrderedListBlock) {
			return true;
		}
		context.Indent = 0;
		return true;
	}

	private static parseLeafBlock(context: Context): void {
		let isParagraph = false;
		let isBlankLine = false;
		this.parseIndent(context);
		if (context.Indent >= Parser.TAB_SIZE) {
			this.parseIndentedCodeBlock(context);
		} else if (this.parseBlankLine(context)) {
			isBlankLine = true;
		} else if (this.parseHeading(context)) {
			// Do nothing
		} else if (this.parseHr(context)) {
			// Do nothing
		} else if (this.parseFencedCodeBlock(context)) {
			// Do nothing
		} else {
			this.parseParagraph(context);
			isParagraph = true;
		}

		if (!BlankLineBlock && context.BlankLine) {
			context.BlankLine = false;
		}

		if (!isParagraph && context.Paragragh != null) {
			context.Paragragh = null;
		}
	}

	private static parseBlankLine(context: Context): boolean {
		console.assert(context.Indent < Parser.TAB_SIZE);

		let column = context.Column;
		let c = undefined;
		let matched = true;
		while ((c = context.Peek(column)) != undefined) {
			if (!Context.IsWhiteSpace(c) && !Context.IsEOL(c)) {
				matched = false;
				break;
			}
			column += 1;
		}

		if (!matched) {
			return false;
		}

		const bl = new BlankLineBlock();
		context.Container.Append(bl);
		bl.Indent = context.Indent;
		context.Indent = 0;
		context.BlankLine = true;
		return true;
	}

	private static parseHeading(context: Context): boolean {
		let column = context.Column;

		let c = undefined;
		let level = 0;
		while (level < 6 && (c = context.Peek(column)) == '#') {
			level += 1;
			column += 1;
		}

		if (c && !Context.IsWhiteSpace(c)) {
			return false;
		}
		column += 1;

		const content = context.Buffer.substring(column).trimEnd();
		const heading = new HeadingBlock(level, content);
		context.Container.Append(heading);
		heading.Indent = context.Indent;
		context.Indent = 0;
		return true;
	}

	private static parseHr(context: Context): boolean {
		let column = context.Column;
		let count = 0;
		let c = undefined;
		let bullet = undefined;
		while ((c = context.Peek(column)) != undefined) {
			if (Context.IsWhiteSpace(c) || Context.IsEOL(c)) {
				column += 1;
			} else if (c == '-' || c == '_' || c == '*') {
				if (bullet == undefined) {
					bullet = c;
				}
				if (bullet == c) {
					count += 1;
					column += 1;
				} else {
					break;
				}
			} else {
				break;
			}
		}

		if (count < 3) {
			return false;
		}

		const hr = new HrBlock();
		context.Container.Append(hr);
		hr.Indent = context.Indent;
		context.Indent = 0;
		return true;
	}

	private static parseIndentedCodeBlock(context: Context): void {
		const leak = context.Indent - Parser.TAB_SIZE;
		const block = context.Container.Last();
		if (block && block instanceof IndentedCodeBlock) {
			block.Content += ' '.repeat(leak) + context.Buffer.substring(context.Column);
		} else {
			context.Container.Append(new IndentedCodeBlock(' '.repeat(leak) + context.Buffer.substring(context.Column)));
		}
		context.Indent = 0;
	}

	private static parseFencedCodeBlock(context: Context): boolean {
		const block = context.Container.Last();
		let length = 0;
		let c = undefined;
		let bullet = undefined;
		let column = context.Column;
		if (block && block instanceof FencedCodeBlock && !block.Closed) {
			// TODO: Check that this line is a end of 'FencedCodeBlock'
			let origin = column;
			bullet = block.Bullet;
			while ((c = context.Peek(column)) != undefined) {
				if (c == '~' || c == '`') {
					if (bullet == c) {
						length += 1;
					} else {
						break;
					}
				} else {
					break;
				}
				column += 1;
			}

			column = context.SkipWhiteSpace(column);
			if (column == context.Buffer.length && length >= block.Length) {
				block.Closed = true;
			} else {
				let leak = Math.max(0, context.Indent - block.Indent);
				block.Content += ' '.repeat(leak) + context.Buffer.substring(origin);
			}
			context.Indent = 0;
			return true;
		}

		while ((c = context.Peek(column)) != undefined) {
			if (c == '~' || c == '`') {
				if (bullet == undefined) {
					bullet = c;
				}
				if (bullet == c) {
					length += 1;
				} else {
					break;
				}
			} else {
				break;
			}
			column += 1;
		}

		if (bullet == undefined || length < 3) {
			return false;
		}

		column = context.SkipWhiteSpace(column);
		const language = context.Buffer.substring(column).trimEnd();

		const fencedCodeBlock = new FencedCodeBlock(length, bullet, language);
		context.Container.Append(fencedCodeBlock);
		fencedCodeBlock.Indent = context.Indent;
		context.Indent = 0;
		return true;
	}

	private static parseParagraph(context: Context): void {
		if (context.Paragragh != null) {
			context.Paragragh.Content += context.Buffer.substring(context.Column);
		} else {
			const p = new ParagraphBlock(context.Container, context.Buffer.substring(context.Column));
			p.Indent = context.Indent;
			context.Container.Append(p);
			context.Paragragh = p;
		}
		context.Indent = 0;
	}
};