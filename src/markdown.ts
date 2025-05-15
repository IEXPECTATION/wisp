import { BlockQuoteBlock, ContainerBlock, DocumentBlock, HeadingBlock } from "./markdown/block";

class Context {
	constructor(input: string) {
		this.input = input;
	}

	Done(): boolean {
		return this.position == this.input.length;
	}

	ReadLine(): void {
		this.Column = 0;
		this.Indent = 0;
		this.Buffer = "";

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
	RemainingTabSize: number = 0;
	Indent: number = 0;
	Column: number = 0;
	Row: number = 0;

	private input: string;
	private position: number = 0;
}


export class Markdown {
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
		let tabSize = Markdown.TAB_SIZE;
		let finished = false;

		while (!finished && column < context.Buffer.length) {
			let c = context.Buffer[column];
			switch (c) {
				case ' ': {
					indent += 1;
					tabSize -= 1;
					if (tabSize == 0) {
						tabSize = Markdown.TAB_SIZE;
					}
				}
					break;
				case '\t': {
					indent += tabSize;
					tabSize = Markdown.TAB_SIZE;
				}
					break;
				default:
					finished = true;
					break;
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
		let matched = false;
		while (context.Peek(column) == '>') {
			matched = true;
			const block = context.Container.Last();
			if (block instanceof BlockQuoteBlock) {
				context.Container = block
			} else {
				let bq = new BlockQuoteBlock(context.Container)
				context.Container.Append(bq);
				context.Container = bq;
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
			context.RemainingTabSize = Markdown.TAB_SIZE - (column % Markdown.TAB_SIZE);
			column += 1;
		} else {
			// Do nothing
		}

		context.Column = column;
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

		if (this.parseBlankLine(context)) {
			return;
		} else if (this.parseHeading(context)) {
			return;
		}

	}

	private static parseBlankLine(context: Context): boolean {
		return false;
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
		context.Container.Append(new HeadingBlock(level, content));
		return true;
	}

	private static parseHr(context: Context): void {

	}

	private static parseIndentedCodeBlock(context: Context): void {

	}

	private static parseFencedCodeBlock(context: Context): void {

	}

	private static parseParagraph(context: Context): void {

	}

};

const document = Markdown.Parse("> # heading\n>> ## heading\n> ### heading\n>>> #### heading");
console.dir(document, { depth: Infinity });