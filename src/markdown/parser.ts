import { BlankLineBlock, ContainerBlock, HeadingBlock, LeafBlock, DocumentBlock, ListItemBlock, HrBlock, ParagraphBlock, FencedCodeBlock, Block, IndentedCodeBlock, BlockQuoteBlock } from "./block";
import { Scanner } from "./scanner";

class Context {
	Buffer: string = "";
	Document: ContainerBlock = new DocumentBlock();
	Container: ContainerBlock = this.Document;
	Indent: number = 0;
	Column: number = 0;
	Row: number = 0;

	Peek(scanner: Scanner, position: number): string | undefined {
		return undefined
	}
}

export class Parser {
	constructor(scanner: Scanner) {
		this.scanner = scanner;
	}


	_Parse(): ContainerBlock {
		const context = new Context();
		while (!this.scanner.End() || this.buffer != "") {

		}

		return context.Document;
	}

	private _parseContainerBlokc(context: Context) {
		// TODO:
		// parseBlockQuote(context);
		// parseUnorderedList(context);
		// parseOrderedList(context);
	}

	private _parseLeafBlock(context: Context) {
		// TODO:
		// parseBlankLine(context);
		// parseHeading(context);
		// parseHr(context);
		// parseIndentedCodeBlock(context);
		// parseFencedCodeBlock(context);
		// parseParagraph(context);
	}



	Parse(): ContainerBlock {
		let indented = false;
		while (!this.scanner.End() || this.buffer != "") {
			this.parseIndent();
			indented = this.checkIndent();

			if (indented && this.parseIndentedCodeBlock()) {
				continue;
			}

			if (this.parseBlankLine()) {
				continue;
			} else if (this.parseHeadingBlock()) {
				continue;
			} else if (this.parseHrBlock()) {
				continue;
			} else if (this.parseFencedCodeBlock()) {
				continue;
			} else if (this.parseBlockQuote()) {
				continue;
			}

			this.parseParagraph();
		}
		return this.root;
	}

	private peek(position: number): string | undefined {
		if (position >= this.buffer.length) {
			let offset = position - this.buffer.length + 1;
			while (offset > 0) {
				let c = this.scanner.Read();
				if (c == undefined) {
					return undefined;
				}
				this.buffer += c;
				offset -= 1;
			}
		}
		return this.buffer[position];
	}

	private readLine(position: number, withEol: boolean = true): { position: number, buffer: string } {
		let finished = false;

		let eol = "";
		let c = this.peek(position);
		// Check the next character is eol.
		let buffer = "";
		while (!finished && c) {
			if (Scanner.IsEol(c)) {
				eol += c;
				position += 1;
				c = this.peek(position);
				if (c && eol != c && Scanner.IsEol(c)) {
					eol += c;
					position += 1;
				}
				if (withEol) {
					buffer += eol;
				}
				break;
			}

			buffer += c;
			position += 1;
			c = this.peek(position);
		}

		return { position, buffer };
	}

	private parseIndent(): void {
		let position = 0;
		let indent = 0;
		let tabSize = Parser.TAB_SIZE;
		let finished = false;

		indent += this.remainingTabSize;
		this.remainingTabSize = 0;

		while (!finished) {
			let c = this.peek(position);
			if (c == undefined) {
				break;
			}

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
				position += 1;
			}
		}

		this.indent = indent;
		this.position = position;
	}

	private checkIndent(): boolean {
		const lastBlock = this.getLastBlock();

		if (lastBlock && (lastBlock instanceof ParagraphBlock || lastBlock instanceof FencedCodeBlock && !lastBlock.Closed)) {
			return false;
		}

		if (this.indent - this.current.Offset >= Parser.TAB_SIZE) {
			return true;
		}
		return false;
	}

	private getLastBlock(): Block | undefined {
		if (this.current.Blocks.length > 0) {
			return this.current.Blocks[this.current.Blocks.length - 1];
		}
		return undefined;
	}

	private parseHeadingBlock(): boolean {
		const { level, position } = this.headingPrefix();
		if (level == 0) {
			return false;
		}

		const { position: newPosition, buffer } = this.readLine(position, false);
		const heading = new HeadingBlock(level, buffer);
		this.appendLeafBlock(heading);
		this.buffer = this.buffer.substring(newPosition);
		return true;
	}

	private headingPrefix(): { level: number, position: number } {
		let position = this.position;
		let level = 0;
		let c = this.peek(position);

		while (level <= 6 && c && c == '#') {
			level += 1;
			position += 1;
			c = this.peek(position);
		}

		if (level == 0) {
			return { level, position: 0 };
		}

		position += 1;
		if (c && Scanner.IsWhiteSpace(c)) {
			return { level, position };
		} else {
			return { level: 0, position: 0 };
		}
	}

	private parseHrBlock(): boolean {
		const { position, buffer } = this.readLine(this.position);
		let count = 0;
		let bullet = "";
		for (let c of buffer) {
			if (c == '-' || c == '_' || c == '*') {
				if (bullet == "") {
					bullet = c;
				}

				if (bullet == c) {
					count += 1;
				}
			} else if (c != ' ' && c != '\t') {
				break;
			} else {
				console.assert(c == ' ' || c == '\t');
			}
		}

		if (count < 3) {
			return false;
		}

		this.appendLeafBlock(new HrBlock());
		this.buffer = this.buffer.substring(position);
		return true;
	}

	private parseIndentedCodeBlock(): boolean {
		let position = this.position;
		let leadingSpace = 0;
		if (this.indent > Parser.TAB_SIZE) {
			leadingSpace = this.indent - Parser.TAB_SIZE;
		}

		const { position: newPosition, buffer } = this.readLine(position);
		let code = ' '.repeat(leadingSpace) + buffer;
		const lastBlock = this.getLastBlock();
		if (lastBlock instanceof IndentedCodeBlock) {
			lastBlock.Content += code;
		} else {
			let block = new IndentedCodeBlock(code);
			this.appendLeafBlock(block);
		}
		this.buffer = this.buffer.substring(newPosition);
		return true;
	}

	private parseFencedCodeBlock(): boolean {
		const lastBlock = this.getLastBlock();
		const { position, buffer } = this.readLine(this.position);

		if (lastBlock && lastBlock instanceof FencedCodeBlock) {
			const { length, bullet, language } = this.fencedCodePrefix(buffer, lastBlock.Bullet);
			if (length >= lastBlock.Length) {
				lastBlock.Closed = true;
			} else {
				if (lastBlock.Offset < this.indent) {
					lastBlock.Content += ' '.repeat(this.indent - lastBlock.Offset);
				}

				lastBlock.Content += buffer;
			}
		} else {
			const { length, bullet, language } = this.fencedCodePrefix(buffer);
			if (length > 0) {
				this.appendLeafBlock(new FencedCodeBlock(length, bullet, this.indent, language));
			} else {
				return false;
			}
		}

		this.buffer = this.buffer.substring(position);
		return true;
	}

	private fencedCodePrefix(buffer: string, bullet: string = ''): { length: number, bullet: string, language: string } {
		let length = 0;

		let i = 0;
		for (; i < buffer.length; i++) {
			if (buffer[i] == '`' || buffer[i] == '~') {
				if (bullet == '') {
					bullet = buffer[i];
				}

				if (bullet == buffer[i]) {
					length += 1;
				}
			} else {
				break;
			}
		}

		if (length == 0) {
			return { length, bullet: '', language: "" };
		}

		if (i == buffer.length) {
			return { length, bullet, language: "" };
		}

		let language = buffer.substring(i).trim();
		return { length, bullet, language };
	}

	private parseParagraph() {
		const { position, buffer } = this.readLine(this.position);
		this.appendLeafBlock(new ParagraphBlock(buffer));
		this.buffer = this.buffer.substring(position);
	}

	private parseBlankLine(): boolean {
		const { position, buffer } = this.readLine(this.position, false);

		for (let c of buffer) {
			if (!Scanner.IsWhiteSpace(c)) {
				return false;
			}
		}

		this.appendLeafBlock(new BlankLineBlock());
		this.buffer = this.buffer.substring(position);
		return true;
	}

	private parseBlockQuote(): boolean {
		const { position, nested } = this.blockQuotePrefix();
		if (nested == -1) {
			return false;
		}

		if (this.current instanceof BlockQuoteBlock) {
			let currentNested = this.current.Nested;
			if (currentNested < nested) {
				while (currentNested < nested) {
					currentNested += 1;
					const bq = new BlockQuoteBlock(this.current, currentNested);
					this.current.Blocks.push(bq);
					this.current = bq;
				}
			} else {
				while (currentNested > nested) {
					if (this.current.Parent) {
						this.current = this.current.Parent;
					}
				}
			}
		} else {
			for (let i = 0; i < nested; i++) {
				let bq = new BlockQuoteBlock(this.current, i);
				this.current.Blocks.push(bq);
				this.current = bq;
			}
		}

		this.buffer = this.buffer.substring(position);
		return true;
	}

	private blockQuotePrefix(): { position: number, nested: number } {
		let position = this.position;
		let nested = 0;
		let c = this.peek(position);
		while (c == '>') {
			nested += 1;
			position += 1;
			c = this.peek(position);
		}

		if (nested == 0) {
			return { position: 0, nested: -1 };
		}

		if (c == ' ') {
			position += 1;
		}

		if (c == '\t') {
			this.remainingTabSize = Parser.TAB_SIZE - (position % Parser.TAB_SIZE) - 1;
			position += 1;
		}

		return { position, nested };
	}

	private parseOrderList(): boolean {
		let position = this.position;
		let c = this.peek(position);
		if (c == '-' || c == '+' || c == '*') {

		}

		return false;
	}

	private orderListPrefix(): void {

	}

	private parseUnorderList(): boolean {
		return false;
	}

	private appendLeafBlock(b: LeafBlock): void {
		if (this.current instanceof BlockQuoteBlock) {
			if (b instanceof ParagraphBlock) {
				const lastBlock = this.getLastBlock();
				if (lastBlock && lastBlock instanceof ParagraphBlock) {
					lastBlock.Content += b.Content;
					return;
				}
			}
			this.current.Blocks.push(b);
		} else if (this.current instanceof ListItemBlock) {

		} else {
			this.current.Blocks.push(b);
		}
	}

	private static TAB_SIZE = 4;

	private root: ContainerBlock = new DocumentBlock();
	private current: ContainerBlock = this.root;
	private buffer: string = "";
	private position: number = 0;
	private indent: number = 0;
	private remainingTabSize: number = 0;
	private scanner: Scanner;
};
