import { BlankLineBlock, BlockQuoteBlock, ContainerBlock, DocumentBlock, FencedCodeBlock, HeadingBlock, HrBlock, IndentedCodeBlock, ParagraphBlock } from "./blocks";

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
		// this.Indent = 0;
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

	private input: string;
	private position: number = 0;
}

export class Parser {
	static TAB_SIZE: number = 4;

	static Parse(input: string): ContainerBlock {
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
		return false;
	}

	private static parseOrderedList(context: Context): boolean {
		return false;
	}

	private static parseLeafBlock(context: Context): void {
		this.parseIndent(context);
		if (context.Indent >= Parser.TAB_SIZE) {
			this.parseIndentedCodeBlock(context);
			return;
		} else if (this.parseBlankLine(context)) {
			return;
		} else if (this.parseHeading(context)) {
			return;
		} else if (this.parseHr(context)) {
			return;
		} else if (this.parseFencedCodeBlock(context)) {
			return;
		} else {
			this.parseParagraph(context);
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
		}

		if (!matched) {
			return false;
		}

		const bl = new BlankLineBlock();
		bl.Indent = context.Indent;
		context.Indent = 0;
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
		while ((c = context.Peek(column)) != undefined) {
			if (Context.IsWhiteSpace(c) && Context.IsEOL(c)) {
				column += 1;
			} else if (c == '-' || c == '_' || c == '*') {
				count += 1;
				column += 1;
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
		if (block && block instanceof FencedCodeBlock && !block.Closed) {
			// TODO: Check that this line is a end of 'FencedCodeBlock'
		}

		// TODO: Check that this line is a start of 'FencedCodeBlock'
		return false;
	}

	private static parseParagraph(context: Context): void {

	}
};