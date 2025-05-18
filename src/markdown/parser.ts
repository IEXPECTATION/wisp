import { BlankLineBlock, BlockQuoteBlock, ContainerBlock, DocumentBlock, FencedCodeBlock, HeadingBlock, HrBlock, IndentedCodeBlock, ListItemBlock, OrderedListBlock, ParagraphBlock, UnorderedListBlock } from "./blocks";

class Context {
	constructor(input: string) {
		this.input = input;
	}

	/*
		Done returns true if it arrived the end of 'input'. Otherwise it return false.
	*/
	Done(): boolean {
		return this.position == this.input.length;
	}

	/*
		ReadLine reads the next line of 'input', and save it to the 'Buffer'.
	*/
	ReadLine(): void {
		this.Row += 1;
		this.Column = 0;
		this.Buffer = "";
		console.assert(this.Indentation == 0);

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

	/*
		Peek returns the target character that is specified by its position in the 'Buffer'..
	*/
	Peek(position: number): string | undefined {
		if (position < this.Buffer.length) {
			return this.Buffer[position];
		}
		return undefined;
	}

	/*
		TODO:
	*/
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
	Indentation: number = 0;
	Column: number = 0;
	Row: number = 0;

	private input: string;
	private position: number = 0;
}

export class Parser {
	static TAB_SIZE: number = 4;

	static Parse(input: string) {
		const root = Parser.ParseBlock(input);
		return this.ParseInline(root);
	}

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

	private static parseIndentation(context: Context): void {
		let indent = context.Indentation;
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
		context.Indentation = indent;
	}

	private static parseContainerBlock(context: Context): void {
		context.Container = context.Root;
		this.parseIndentation(context);

		while (true) {
			if (this.parseBlockQuote(context)) {
				if (context.Paragragh != null) {
					context.Paragragh = null;
				}
				continue;
			}

			if (this.parseUnorderedList(context)) {
				if (context.Paragragh != null) {
					context.Paragragh = null;
				}
				continue;
			}

			if (this.parseOrderedList(context)) {
				if (context.Paragragh != null) {
					context.Paragragh = null;
				}
				continue;
			}

			if (this.parseListItem(context)) {
				if (context.Paragragh != null) {
					context.Paragragh = null;
				}
				continue;
			}

			break;
		}
	}

	private static parseBlockQuote(context: Context): boolean {
		if (context.Indentation > this.TAB_SIZE) {
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
				let blockQuote = new BlockQuoteBlock()
				context.Container.Append(blockQuote);
				context.Container = blockQuote;
				if (firstBlockQuote == null) {
					firstBlockQuote = blockQuote;
				}
			}
			column += 1;
		}

		if (!matched) {
			return false;
		}

		let c = context.Peek(column);
		if (c == ' ') {
			context.Indentation = 0;
			column += 1;
		} else if (c == '\t') {
			context.Indentation = Parser.TAB_SIZE - (column % Parser.TAB_SIZE);
			column += 1;
		} else {
			// Do nothing
		}

		if (firstBlockQuote != null) {
			firstBlockQuote.Indentation = context.Indentation;
		}
		context.Column = column;
		return true;
	}

	/*
		parseUnorderedList checks taht the first character of the current line is either '+', '*', or '-'.
		And if the indentation of this current line is greater than or equal to the that of last 'ListItemBlock',
		it is a nested list.
	*/
	private static parseUnorderedList(context: Context): boolean {
		if (context.Indentation >= Parser.TAB_SIZE) {
			return false;
		}

		// TODO: We should avoid parsing 'Hr' as an 'UnorderedList' here.
		// 			 However, the current implementation is inelegant.
		//			 Perhaps we should adopt a more robust approach.
		if (this.assumeHr(context)) {
			return false;
		}

		let column = context.Column
		const bullet = context.Peek(column);
		if (bullet != '+' && bullet != '*' && bullet != '-') {
			return false;
		}
		column += 1;

		let c = context.Peek(column);
		if (c == ' ') {
			context.Indentation = 0;
			column += 1;
		} else if (c == '\t') {
			context.Indentation = Parser.TAB_SIZE - (column % Parser.TAB_SIZE);
			column += 1;
		} else {
			return false;
		}

		const block = context.Container.Last();
		if (block && block instanceof UnorderedListBlock) {
			const listItem = block.Last();
			if (listItem && listItem.Indentation <= context.Indentation) {
				context.Container = block;
			}
		}

		let unorderList = new UnorderedListBlock(bullet);
		unorderList.Indentation = context.Indentation;
		context.Container.Append(unorderList);
		context.Container = unorderList;
		context.Column = column;
		context.Indentation = 0;
		return true;
	}

	private static parseOrderedList(context: Context): boolean {
		if (context.Indentation >= Parser.TAB_SIZE) {
			return false;
		}

		// TODO: Recognize the list is 'OrderedList' or not.
		return false;
	}

	/*
		parseListItem parses that the current line is 'ListItemBlock' or not.
		There are two scenarios:
		1. If the current container of context is 'UnorderedListBlock' or 'OrderedListBlock',
			 it creates a new 'ListItemBlock' and appends to the container of context.
		2. If the current container of context is not 'UnorderedListBlock' or 'OrderedListBlock',
			 it checks the last 'ContainerBlock' of container in context, if container is 'UnorderedListBlock'
			 or 'OrderedListBlock', it checks the indentation of the current line. If the indentation is greater
			 than or equal to the indentation of last 'ListItemBLock', the container of context will be set to
			 last 'ListItemBlock'.
	*/
	private static parseListItem(context: Context): boolean {
		if (context.Container instanceof UnorderedListBlock || context.Container instanceof OrderedListBlock) {
			let itemList = new ListItemBlock();
			itemList.Indentation = context.Column;
			context.Container.Append(itemList);
			context.Container = itemList;
			return true;
		} else {
			let block = context.Container.Last();
			if (!(block instanceof UnorderedListBlock) && !(block instanceof OrderedListBlock)) {
				return false;
			}

			block = block.Last();
			if (!(block instanceof ListItemBlock)) {
				return false;
			}

			if (context.Indentation < block.Indentation) {
				return false;
			}

			context.Indentation -= block.Indentation;
			context.Container = block;
			return true;
		}
	}

	private static parseLeafBlock(context: Context): void {
		let isParagraph = false;
		this.parseIndentation(context);
		if (context.Indentation >= Parser.TAB_SIZE) {
			this.parseIndentedCodeBlock(context);
		} else if (this.parseBlankLine(context)) {
			// Do nothing
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

		if (!isParagraph && context.Paragragh != null) {
			context.Paragragh = null;
		}
	}

	private static parseBlankLine(context: Context): boolean {
		console.assert(context.Indentation < Parser.TAB_SIZE);

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

		const blanLine = new BlankLineBlock();
		context.Container.Append(blanLine);
		blanLine.Indentation = context.Indentation;
		context.Indentation = 0;
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
		heading.Indentation = context.Indentation;
		context.Indentation = 0;
		return true;
	}

	private static assumeHr(context: Context): boolean {
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
		return true;
	}

	private static parseHr(context: Context): boolean {
		const is = this.assumeHr(context);
		if (!is) {
			return false;
		}

		const hr = new HrBlock();
		context.Container.Append(hr);
		hr.Indentation = context.Indentation;
		context.Indentation = 0;
		return true;
	}

	private static parseIndentedCodeBlock(context: Context): void {
		const leak = context.Indentation - Parser.TAB_SIZE;
		const block = context.Container.Last();
		if (block && block instanceof IndentedCodeBlock) {
			block.Content += ' '.repeat(leak) + context.Buffer.substring(context.Column);
		} else {
			context.Container.Append(new IndentedCodeBlock(' '.repeat(leak) + context.Buffer.substring(context.Column)));
		}
		context.Indentation = 0;
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
				let leak = Math.max(0, context.Indentation - block.Indentation);
				block.Content += ' '.repeat(leak) + context.Buffer.substring(origin);
			}
			context.Indentation = 0;
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

		const fencedCode = new FencedCodeBlock(length, bullet, language);
		context.Container.Append(fencedCode);
		fencedCode.Indentation = context.Indentation;
		context.Indentation = 0;
		return true;
	}

	private static parseParagraph(context: Context): void {
		if (context.Paragragh != null) {
			context.Paragragh.Content += context.Buffer.substring(context.Column);
		} else {
			const p = new ParagraphBlock(context.Container, context.Buffer.substring(context.Column));
			p.Indentation = context.Indentation;
			context.Container.Append(p);
			context.Paragragh = p;
		}
		context.Indentation = 0;
	}
};