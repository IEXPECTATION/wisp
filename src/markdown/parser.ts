import { Scanner } from "./scanner";
import { BlankLineBlock, Block, BlockTag, FencedCodeBlock, HeadingBlock, HrBlock, IndentedCodeBlock } from "./block";

// export interface PasrerConfig {
// 	TAB_SIZE?: number;
// };

// export function MakeDefaultParserConfig() {

// }

// export class Parser {
// 	// Return a ast of markdown document. This ast can be passed to a renderer.
// 	Parse(input: string) {
// 		this.input = input;
// 		this.parseBlocks();
// 		// return this.tokens;
// 		let document = new Node(NodeTag.Document);
// 		this.parseInlines(document, this.tokens);
// 		return document;
// 	}

// 	private parseBlocks() {
// 		let scanner = new Scanner(this.input);
// 		let matched = null;

// 		while (!scanner.End()) {
// 			this.indent = this.whiteSpace(scanner);

// 			matched = this.containerBlcoks(scanner);
// 			this.leafBlocks(matched != null ? matched.Tokens() : this.tokens, scanner);
// 		}
// 	}

// 	private parseInlines(node: Node, tokens: Tokens) {
// 		for (let token of tokens) {
// 			this.inlines(node, token);
// 		}
// 	}

// 	private containerBlcoks(scanner: Scanner): ContainerBlock | null {
// 		let matched: ContainerBlock | null = null;
// 		let token = null;
// 		let tokens = this.tokens;
// 		while (true) {
// 			if (this.indent < this.TAB_SIZE && (token = this.blockQuote(tokens, scanner)) != null) {
// 				tokens = token.Tokens();
// 				matched = token;
// 				continue;
// 			} else if ((token = this.List(tokens, scanner)) != null) {
// 				tokens = token.Tokens();
// 				matched = token;
// 				continue;
// 			}

// 			break;
// 		}

// 		return matched;
// 	}

// 	private leafBlocks(tokens: Tokens, scanner: Scanner) {
// 		if (scanner.End()) {
// 			return;
// 		}

// 		if (this.indent < this.TAB_SIZE) {
// 			if (this.heading(tokens, scanner)) {
// 				return;
// 			} else if (this.setextHeading(tokens, scanner)) {
// 				return;
// 			} else if (this.blankline(tokens, scanner)) {
// 				return;
// 			} else if (this.hr(tokens, scanner)) {
// 				return;
// 			} else if (this.fencedCode(tokens, scanner)) {
// 				return;
// 			} else {
// 				this.paragraph(tokens, scanner);
// 				return;
// 			}
// 		} else {
// 			if (this.indentedCode(tokens, scanner)) {
// 				return;
// 			}
// 		}

// 		console.assert(false, "Unreach code.")
// 	}



// 	private blockQuote(tokens: Tokens, scanner: Scanner) {
// 		let lastToken = null;
// 		while (scanner.Consume('>')) {
// 			lastToken = this.findLastTargetToken(BlockTag.BlockQuote, tokens) as BlockQuoteToken;
// 			if (lastToken == null) {
// 				lastToken = new BlockQuoteToken();
// 				this.appendToken(tokens, lastToken);
// 			}
// 			tokens = lastToken.Tokens();
// 		}

// 		if (lastToken != null) {
// 			scanner.Consume(' ');
// 		}

// 		if (lastToken) {
// 			this.indent = this.whiteSpace(scanner);
// 		}
// 		return lastToken;
// 	}

// 	private List(tokens: Tokens, scanner: Scanner) {
// 		let list = null;

// 		list = this.orderedList(tokens, scanner);
// 		if (list) {
// 			return list;
// 		}

// 		list = this.unorderedList(tokens, scanner);
// 		if (list) {
// 			return list;
// 		}

// 		return null;
// 	}

// 	private orderedList(tokens: Tokens, scanner: Scanner) {
// 		let list = this.findLastTargetToken(BlockTag.OrderedList, tokens) as OrderedListToken;
// 		if (list) {
// 			let item = this.lastToken(list.Tokens())! as ListItemToken;

// 			// Skip all blank lines.
// 			while (this.blankline(item.Tokens(), scanner)) {
// 				this.indent = this.whiteSpace(scanner);
// 			}

// 			// If the last token is a ordered list, we should check the offset is equal or not.
// 			if (this.indent >= item.Offset()) {
// 				// This line is belong to this list, return the last list item.
// 				if (this.lastToken(item.Tokens())?.Kind() == BlockTag.BlankLine) {
// 					item.SetTight(false);
// 				}

// 				this.indent -= item.Offset();
// 				return item;
// 			}
// 		}

// 		// If there are only blank lines flowering the list item and we are now at the end of input.
// 		// So we should return null.
// 		if (scanner.End()) {
// 			return null;
// 		}

// 		// Otherwise check this line is a new ordered list item or not.
// 		let prefix = this.orderedListItemPreifx(scanner);
// 		if (prefix == null) {
// 			return null;
// 		}

// 		if (list == null || prefix.startNumber == '1' || prefix.delimitation != list.Delimitation()) {
// 			// It is a new ordered list.
// 			let list = new OrderedListToken(prefix.startNumber, prefix.delimitation);
// 			this.appendToken(tokens, list);
// 			let item = new ListItemToken(prefix.offset);
// 			this.appendToken(list.Tokens(), item);
// 			return item;
// 		}

// 		let item = new ListItemToken(prefix.offset);
// 		this.appendToken(list.Tokens(), item);

// 		return item;
// 	}

// 	private unorderedList(tokens: Tokens, scanner: Scanner) {
// 		let list = this.findLastTargetToken(BlockTag.UnorderedList, tokens) as UnorderedListToken;
// 		if (list) {
// 			let item = this.lastToken(list.Tokens())! as ListItemToken;

// 			// Skip all blank lines.
// 			while (this.blankline(item.Tokens(), scanner)) {
// 				this.indent = this.whiteSpace(scanner);
// 			}

// 			// If the last token is a unordered list, we should check the indent is large and equal to offset.
// 			if (this.indent >= item.Offset()) {
// 				// This line is belong to this list, return the last list item.
// 				if (this.lastToken(item.Tokens())?.Kind() == BlockTag.BlankLine) {
// 					item.SetTight(false);
// 				}

// 				this.indent -= item.Offset();
// 				return item;
// 			}
// 		}

// 		// If there are only blank lines flowering the list item and we are now at the end of input.
// 		// So we should return null.
// 		if (scanner.End()) {
// 			return null;
// 		}

// 		// Otherwise check this line is a new unordered list item or not.
// 		let prefix = this.unorderedListItemPrefix(scanner);
// 		if (prefix == null) {
// 			return null;
// 		}

// 		if (list == null || prefix.bullet != list.Bullet()) {
// 			// It is a new ordered list.
// 			let list = new UnorderedListToken(prefix.bullet);
// 			this.appendToken(tokens, list);
// 			let item = new ListItemToken(prefix.offset);
// 			this.appendToken(list.Tokens(), item);
// 			return item;
// 		}

// 		let item = new ListItemToken(prefix.offset);
// 		this.appendToken(list.Tokens(), item);

// 		return item;
// 	}

// 	private isDigit(char: string) {
// 		return "0123456789".includes(char);
// 	}

// 	private orderedListItemPreifx(scanner: Scanner): orderedListItemPreifx | null {
// 		scanner.Push();

// 		let skipZero = true;
// 		let peek = scanner.Peek();
// 		let startNumber = "";

// 		while (this.isDigit(peek)) {
// 			if (skipZero) {
// 				if (peek == '0') {
// 					peek = scanner.Next();
// 					continue;
// 				}

// 				skipZero = false;
// 			}

// 			startNumber += peek;
// 			if (startNumber.length > 9) {
// 				scanner.Pop();
// 				return null;
// 			}

// 			peek = scanner.Next();
// 		}

// 		if (skipZero) {
// 			startNumber = "0";
// 		}

// 		let delimitation = peek;
// 		if (delimitation != '.' && delimitation != ')') {
// 			scanner.Pop();
// 			return null;
// 		}
// 		scanner.Skip();

// 		if (!scanner.Consume(' ')) {
// 			scanner.Pop();
// 			return null
// 		}

// 		let offset = startNumber.length + 2;
// 		this.indent = this.whiteSpace(scanner);
// 		if (this.indent < 3) {
// 			offset += this.indent;
// 		}

// 		scanner.Clear();
// 		return { startNumber, delimitation, offset };
// 	}

// 	private unorderedListItemPrefix(scanner: Scanner): unorderedListItemPrefix | null {
// 		scanner.Push();

// 		let bullet = scanner.Peek();
// 		if (bullet != '-' && bullet != '+' && bullet != '*') {
// 			scanner.Pop();
// 			return null;
// 		}
// 		scanner.Skip();

// 		if (!scanner.Consume(' ')) {
// 			scanner.Pop();
// 			return null
// 		}

// 		let offset = 2;
// 		this.indent = this.whiteSpace(scanner);
// 		if (this.indent < 3) {
// 			offset += this.indent;
// 		}

// 		scanner.Clear();
// 		return { bullet, offset };
// 	}

// 	private headingLevel(scanner: Scanner) {
// 		let count = 0;
// 		while (count <= 6) {
// 			if (scanner.Consume('#')) {
// 				count += 1;
// 			} else {
// 				break;
// 			}
// 		}

// 		return count;
// 	}

// 	private heading(tokens: Tokens, scanner: Scanner) {
// 		scanner.Push();
// 		let level = this.headingLevel(scanner);
// 		if (level == 0) {
// 			scanner.Pop();
// 			return false;
// 		}

// 		if (!scanner.Consume(' ')) {
// 			scanner.Pop();
// 			return false;
// 		}

// 		let text = this.readLine(scanner);
// 		this.appendToken(tokens, new HeadingToken(level, text));

// 		scanner.Clear();
// 		return true;
// 	}

// 	private setextHeading(tokens: Tokens, scanner: Scanner) {
// 		let lastToken = this.findLastTargetToken(BlockTag.Paragraph, tokens) as ParagraphToken;
// 		if (lastToken == null) {
// 			return false;
// 		}

// 		scanner.Push();
// 		let bullet = scanner.Next();

// 		if (bullet != '=' && bullet != '-') {
// 			scanner.Pop();
// 			return false;
// 		}

// 		let count = 1;
// 		while (!scanner.End()) {
// 			if (this.eol(scanner)) {
// 				break;
// 			}

// 			if (!scanner.Consume(bullet)) {
// 				break;
// 			}

// 			count += 1;
// 		}

// 		if (count < 3) {
// 			scanner.Pop();
// 			return false;
// 		}

// 		tokens.pop();
// 		tokens.push(new HeadingToken(bullet == '=' ? 1 : 2, lastToken.Content()))
// 		scanner.Clear();
// 		return true;
// 	}

// 	private blankline(tokens: Tokens, scanner: Scanner) {
// 		if (scanner.End()) {
// 			return false;
// 		}

// 		scanner.Push();
// 		while (!scanner.End()) {
// 			if (this.eol(scanner)) {
// 				break;
// 			}

// 			if (!(scanner.Consume(' ') || (scanner.Consume('\t')))) {
// 				scanner.Pop();
// 				return false;
// 			}
// 		}

// 		this.appendToken(tokens, new BlankLineToken());

// 		scanner.Clear();
// 		return true;
// 	}

// 	private hr(tokens: Tokens, scanner: Scanner) {
// 		scanner.Push();
// 		let count = 0;

// 		while (!scanner.End()) {
// 			if (this.eol(scanner)) {
// 				break;
// 			}

// 			if (scanner.Consume('*') ||
// 				scanner.Consume('-') ||
// 				scanner.Consume('_')) {
// 				count += 1;
// 				continue;
// 			}

// 			if (scanner.Consume(' ') || scanner.Consume('\t')) {
// 				continue;
// 			}

// 			scanner.Pop();
// 			return false;
// 		}

// 		if (count >= 3) {
// 			this.appendToken(tokens, new HrToken());
// 			scanner.Clear();
// 			return true;
// 		}

// 		scanner.Pop();
// 		return false;
// 	}

// 	private fencedCode(tokens: Tokens, scanner: Scanner) {
// 		let lastToken = this.findLastTargetToken(BlockTag.FencedCode, tokens) as FencedCodeToen;
// 		if (lastToken && !lastToken.Closed()) {
// 			let fenced = lastToken;
// 			let bullet = fenced.Bullet();
// 			let count = fenced.Length();
// 			let offset = fenced.Offset();

// 			scanner.Push();
// 			let endCount = 0;
// 			while (!scanner.End() && scanner.Consume(bullet)) {
// 				endCount += 1;
// 			}

// 			if (endCount >= count) {
// 				this.skipLine(scanner);
// 				fenced.Close();
// 			} else {
// 				scanner.Pop();
// 				fenced.SetContent(fenced.Content() + " ".repeat(Math.max(0, this.indent - offset)) + this.readLine(scanner));
// 			}
// 		} else {
// 			scanner.Push();
// 			let offset = this.indent;
// 			let bullet = scanner.Next();
// 			if (bullet != '~' && bullet != '`') {
// 				scanner.Pop();
// 				return false;
// 			}
// 			let count = 1;
// 			while (!scanner.End() && scanner.Consume(bullet)) {
// 				count += 1;
// 			}
// 			if (count < 3) {
// 				scanner.Pop();
// 				return false;
// 			}

// 			// TODO: Recognize the language of code.
// 			this.skipLine(scanner);

// 			this.appendToken(tokens, new FencedCodeToen(bullet, count, offset));
// 			scanner.Clear();
// 		}

// 		return true;
// 	}

// 	private indentedCode(tokens: Tokens, scanner: Scanner) {
// 		let lastToken = this.findLastTargetToken(BlockTag.IndentedCode, tokens);
// 		if (lastToken && lastToken.Kind() == BlockTag.IndentedCode) {
// 			let indented = lastToken as IndentedCodeToken;
// 			indented.SetContent(indented.Content() + " ".repeat(Math.max(0, this.indent - 4)) + this.readLine(scanner));
// 		} else {
// 			let indented = new IndentedCodeToken();
// 			indented.SetContent(" ".repeat(Math.max(0, this.indent - 4)) + this.readLine(scanner));
// 			this.appendToken(tokens, indented);
// 		}

// 		return true;
// 	}

// 	private paragraph(tokens: Tokens, scanner: Scanner) {
// 		let lastToken = this.findLastTargetToken(BlockTag.Paragraph, tokens, true) as ParagraphToken;

// 		let line = this.readLine(scanner);
// 		if (lastToken != null) {
// 			lastToken.SetContent(lastToken.Content() + line);
// 			return;
// 		}

// 		tokens.push(new ParagraphToken(line));
// 	}

// 	private reference(paragraph: string) {
// 		return null;
// 	}

// 	private inlines(root: Node, token: Token) {
// 		let node = null;
// 		switch (token.Kind()) {
// 			case BlockTag.BlankLine:
// 				return;
// 			case BlockTag.Heading: {
// 				let heading = token as HeadingToken;
// 				switch (heading.Level()) {
// 					case 1:
// 						node = new Node(NodeTag.H1);
// 						break;

// 					case 2:
// 						node = new Node(NodeTag.H2);
// 						break

// 					case 3:
// 						node = new Node(NodeTag.H3);
// 						break;

// 					case 4:
// 						node = new Node(NodeTag.H4);
// 						break;

// 					case 5:
// 						node = new Node(NodeTag.H5);
// 						break;

// 					case 6:
// 						node = new Node(NodeTag.H6);
// 						break;
// 				}

// 				if (node == null) {
// 					throw new Error("Unknown heading level!");
// 				}

// 				// TODO:
// 				this.inline(node, heading.Content().trimEnd());
// 			}
// 				break;
// 			case BlockTag.Hr: {
// 				node = new Node(NodeTag.Hr);
// 			}
// 				break;
// 			case BlockTag.BlockQuote: {
// 				node = new Node(NodeTag.BlockQuote);
// 				let blockquote = token as BlockQuoteToken;
// 				this.parseInlines(node, blockquote.Tokens());
// 			}
// 				break;
// 			case BlockTag.IndentedCode:
// 			case BlockTag.FencedCode: {
// 				let leafBlock = token as LeafBlock;
// 				node = new Node(NodeTag.Code);
// 				let text = new Node(NodeTag.Text);
// 				text.SetText(leafBlock.Content());
// 				node.SetChild(text);
// 			}
// 				break;
// 			case BlockTag.Reference: {
// 				// TODO:
// 			}
// 				break;
// 			case BlockTag.Paragraph: {
// 				let paragraph = token as ParagraphToken;
// 				node = new Node(NodeTag.Paragraph);
// 				this.inline(node, paragraph.Content().trimEnd());
// 			}
// 				break;
// 			case BlockTag.OrderedList: {
// 				let orderedList = token as OrderedListToken;
// 				node = new Node(NodeTag.Ol);
// 				node.SetText(orderedList.StartNumber());
// 				this.parseInlines(node, orderedList.Tokens());
// 			}
// 				break;
// 			case BlockTag.UnorderedList: {
// 				// TODO:
// 				let unorderedList = token as UnorderedListToken;
// 				node = new Node(NodeTag.Ul);
// 				this.parseInlines(node, unorderedList.Tokens());
// 			}
// 				break;
// 			case BlockTag.ListItem: {
// 				let listItem = token as ListItemToken;
// 				node = new Node(NodeTag.Li);
// 				if (listItem.Tight()) {
// 					this.inline(node, (listItem.Tokens()[0] as LeafBlock).Content().trimEnd());
// 				} else {
// 					this.parseInlines(node, listItem.Tokens());
// 				}
// 			}
// 				break;
// 			default: {
// 				throw new Error("Unknown token kind!");
// 			}
// 		}

// 		root.SetChild(node!);
// 	}

// 	private inline(node: Node, content: string) {
// 		let segment = "";
// 		let element = null;
// 		for (let position = 0; position < content.length; position += 1) {
// 			element = this.codeSpan(content.substring(position));
// 			if (element) {
// 				if (segment != "") {
// 					let text = new Node(NodeTag.Text);
// 					text.SetText(segment);
// 					node.SetChild(text);
// 					segment = "";
// 				}

// 				let { codeSpan, length } = element;
// 				node.SetChild(codeSpan);
// 				position += length;
// 			}

// 			element = this.emphasis(content.substring(position));
// 			if (element) {
// 				if (segment != "") {
// 					let text = new Node(NodeTag.Text);
// 					text.SetText(segment);
// 					node.SetChild(text);
// 					segment = "";
// 				}

// 				let { emphasis, length } = element;
// 				node.SetChild(emphasis);
// 				position += length;
// 			}

// 			if (position < content.length) {
// 				segment += content[position];
// 			}
// 		}

// 		if (segment != "") {
// 			let text = new Node(NodeTag.Text);
// 			text.SetText(segment);
// 			node.SetChild(text);
// 		}
// 	}

// 	private codeSpan(content: string) {
// 		if (content[0] != '`') {
// 			return undefined;
// 		}

// 		let backticks = 1;
// 		let position = 1;

// 		if (content[position] == '`') {
// 			backticks += 1;
// 			position += 1;
// 		}

// 		let leadingSpace = 0;
// 		while (position < content.length) {
// 			if (content[position] == ' ') {
// 				leadingSpace += 1;
// 				position += 1;
// 				continue;
// 			}
// 			break;
// 		}

// 		let code = "";
// 		let accept = false;
// 		let stop = 0;
// 		while (position < content.length) {
// 			while (content[position] == '`') {
// 				stop += 1;
// 				position += 1;
// 			}

// 			if (stop == backticks) {
// 				accept = true;
// 				break;
// 			}

// 			while (stop > 0) {
// 				code += '`';
// 				stop -= 1;
// 			}

// 			code += content[position];
// 			position += 1;
// 		}

// 		if (!accept) {
// 			return undefined;
// 		}

// 		let trailingSpace = 0;
// 		while (position < content.length) {
// 			if (content[position] == ' ') {
// 				trailingSpace += 1;
// 				position += 1;
// 				continue;
// 			}
// 			break;
// 		}

// 		let text = " ".repeat(Math.max(0, leadingSpace - 1)) + code + " ".repeat(Math.max(0, trailingSpace - 1));
// 		let codeSpan = new Node(NodeTag.CodeSpan);
// 		codeSpan.SetText(text);

// 		return {
// 			codeSpan: codeSpan, length: position + 1
// 		};
// 	}

// 	private emphasis(content: string) {
// 		// TODO: Need a new implement.
// 		if (content[0] != '*' && content[0] == '_') {
// 			return undefined;
// 		}

// 		let bullet = content[0];
// 		let position = 1;
// 		let begin = 1;
// 		let end = 0;
// 		let text = "";
// 		let accept = false;
// 		let root = null;

// 		if (bullet == '*') {
// 			while (position < content.length) {
// 				if (content[position] == bullet) {
// 					begin += 1;
// 					position += 1;
// 				} else {
// 					break;
// 				}
// 			}

// 			while (position < content.length) {
// 				if (content[position] == bullet) {
// 					accept = true;
// 					break;
// 				}

// 				text += content[position];
// 				position += 1;
// 			}

// 			if (!accept) {
// 				return undefined;
// 			}

// 			while (position < content.length) {
// 				if (content[position] == bullet) {
// 					end += 1;
// 					position += 1;
// 				} else {
// 					break;
// 				}
// 			}

// 			text = '*'.repeat(Math.max(0, begin - end)) + text + '*'.repeat(Math.max(0, end - begin));
// 			let length = Math.min(begin, end);

// 			let parent = null;
// 			let emphasis = null;
// 			while (length > 0) {
// 				if (length >= 2) {
// 					emphasis = new Node(NodeTag.Bold);
// 					length -= 2;
// 				} else {
// 					emphasis = new Node(NodeTag.Italic);
// 					length -= 1;
// 				}

// 				if (parent == null) {
// 					parent = emphasis;
// 					root = parent;
// 				} else {
// 					parent.SetChild(emphasis);
// 					parent = emphasis;
// 				}
// 			}

// 			let t = new Node(NodeTag.Text);
// 			t.SetText(text);
// 			parent!.SetChild(t);
// 		} else if (bullet == '_') {
// 			while (position < content.length) {
// 				if (content[position] == bullet) {
// 					begin += 1;
// 					position += 1;
// 				} else {
// 					break;
// 				}
// 			}

// 			if (content[position] != ' ') {
// 				return undefined;
// 			}


// 			root = new Node(NodeTag.Italic);
// 		} else {
// 			return undefined;
// 		}

// 		return { emphasis: root!, length: position + 1 };
// 	}

// 	private link(content: string) {

// 	}



// 	private appendToken(tokens: Tokens, token: Token) {
// 		let paragraph = this.findLastTargetToken(BlockTag.Paragraph, tokens, true) as ParagraphToken;
// 		if (paragraph) {
// 			// TODO: Check this paragraph is a reference link defination.
// 			let ref = this.reference(paragraph.Content());
// 			if (ref) {
// 				let parent = this.findParentOfTargetToken(paragraph, tokens)!;
// 				parent.pop();
// 				parent.push(ref);
// 			}
// 		}

// 		tokens.push(token);
// 	}

// 	private lastToken(tokens: Tokens) {
// 		if (tokens.length > 0) {
// 			return tokens[tokens.length - 1];
// 		}

// 		return null;
// 	}

// 	private findLastTargetToken(kind: BlockTag, tokens: Tokens, deeply: boolean = false): Token | null {
// 		let lastToken = this.lastToken(tokens);

// 		if (lastToken) {
// 			if (lastToken.Kind() == kind) {
// 				return lastToken;
// 			}

// 			if (deeply && isContainerBlock(lastToken)) {
// 				return this.findLastTargetToken(kind, lastToken.Tokens(), deeply);
// 			}
// 		}

// 		return null;
// 	}

// 	private findParentOfTargetToken(token: Token, tokens: Tokens): Tokens | null {
// 		let lastToken = this.lastToken(tokens);
// 		if (lastToken == token) {
// 			return tokens;
// 		}

// 		if (lastToken == null || !isContainerBlock(lastToken)) {
// 			return null
// 		}

// 		return this.findParentOfTargetToken(token, lastToken.Tokens());
// 	}

// 	private readLine(scanner: Scanner) {
// 		let line = "";
// 		while (!scanner.End()) {
// 			if (this.eol(scanner)) {
// 				line += "\n";
// 				break;
// 			}

// 			line += scanner.Peek();
// 			scanner.Skip();
// 		}

// 		return line;
// 	}

// 	private skipLine(scanner: Scanner) {
// 		while (!(scanner.End() || this.eol(scanner))) {
// 			scanner.Skip();
// 		}
// 	}

// 	private eol(scanner: Scanner) {
// 		console.assert(!scanner.End());

// 		let peek = scanner.Peek();
// 		if (peek == '\n') {
// 			scanner.Skip();
// 			return true;
// 		} else if (peek == '\r') {
// 			if (scanner.Next() == '\n') {
// 				scanner.Skip();
// 			}

// 			return true;
// 		}

// 		return false;
// 	}

// 	private whiteSpace(scanner: Scanner): number {
// 		let count = 0;
// 		while (!scanner.End()) {
// 			if (scanner.Consume(' ')) {
// 				count += 1;
// 			} else if (scanner.Consume('\t')) {
// 				count += 4;
// 			} else {
// 				break;
// 			}
// 		}

// 		return count;
// 	}


// 	private input: string = "";
// 	private tokens: Tokens = [];
// 	private indent: number = 0;

// 	private TAB_SIZE: number = 4;
// }

export class Parser {
	constructor(input: string) {
		this.scanner = new Scanner(input);
	}

	static TAB_SIZE = 4;
	Parse(): Block[] {
		do {
			this.buffer = this.scanner.ReadLine();




			// if (this.parseBlankLineBlock()) {
			// 	continue;
			// }

			// this.offset = this.scanner.WhiteSpace();
			// if (this.parseIndentedCode()) {
			// 	continue;
			// }

			// if (this.parseHeadingBlock()) {
			// 	continue;
			// }

			// if (this.parseHrBlock()) {
			// 	continue;
			// }

			// if (this.parseFencedCodeBlock()) {
			// 	continue;
			// }

			// this.parseParagraph();
		} while (this.scanner.End() != true)

		return this.root;
	}

	// private parseBlankLineBlock(): boolean {
	// 	this.scanner.Push();
	// 	this.scanner.WhiteSpace();
	// 	let ch = this.scanner.Peek();
	// 	if (ch == undefined || ch == '\n') {
	// 		this.scanner.Read();
	// 		this.scanner.Clear();
	// 		this.container.push(new BlankLineBlock());
	// 		return true;
	// 	} else {
	// 		this.scanner.Pop();
	// 		return false;
	// 	}
	// }

	// private parseHeadingBlock(): boolean {
	// 	let level = 0;
	// 	this.scanner.Push();
	// 	while (level <= 6 && this.scanner.Consume('#')) {
	// 		level += 1;
	// 	}

	// 	if (level == 0 || !this.scanner.Consume(' ')) {
	// 		this.scanner.Pop();
	// 		return false;
	// 	}

	// 	let content = "";
	// 	let ch = this.scanner.Read();
	// 	while (ch != '\n' && ch != undefined) {
	// 		content += ch;
	// 		ch = this.scanner.Read();
	// 	}

	// 	// TODO: Handle the block defination

	// 	this.scanner.Clear();
	// 	this.container.push(new HeadingBlock(level, content))
	// 	return true;
	// }

	// private parseHrBlock(): boolean {
	// 	let ch = undefined;
	// 	let bullet = undefined;
	// 	let count = 0;
	// 	this.scanner.Push();
	// 	while ((ch = this.scanner.Read()) != undefined) {
	// 		if (ch == '_' || ch == '-' || ch == '*') {
	// 			count += 1;
	// 			if (bullet == undefined) {
	// 				bullet = ch;
	// 			}

	// 			if (bullet != ch) {
	// 				this.scanner.Pop();
	// 				return false;
	// 			}
	// 			continue;
	// 		}

	// 		if (ch == '\n') {
	// 			break;
	// 		}

	// 		if (ch != ' ' && ch != '\t') {
	// 			this.scanner.Pop();
	// 			return false;
	// 		}
	// 	}

	// 	if (count < 3) {
	// 		this.scanner.Pop();
	// 		return false;
	// 	}

	// 	this.scanner.Clear();
	// 	this.container.push(new HrBlock());
	// 	return true;
	// }

	// private parseIndentedCode(): boolean {
	// 	if (this.offset < Parser.TAB_SIZE) {
	// 		return false;
	// 	}

	// 	let block = undefined;
	// 	let lastBlock = this.container[this.container.length - 1];
	// 	if (lastBlock && lastBlock.Tag == BlockTag.IndentedCode) {
	// 		block = lastBlock as IndentedCodeBlock;
	// 	} else {
	// 		block = new IndentedCodeBlock();
	// 		this.container.push(block);
	// 	}

	// 	let code = this.scanner.ReadLine();

	// 	this.offset -= Parser.TAB_SIZE;
	// 	let tabSize = this.offset / Parser.TAB_SIZE;
	// 	let spaceSize = this.offset % Parser.TAB_SIZE;
	// 	block.Content += '\t'.repeat(tabSize) + ' '.repeat(spaceSize) + code;
	// 	return true;
	// }

	// private parseFencedCodeBlock(): boolean {
	// 	let block = undefined;
	// 	let lastBlock = this.container[this.container.length - 1];
	// 	if (lastBlock && lastBlock.Tag == BlockTag.FencedCode) {
	// 		block = lastBlock as FencedCodeBlock;

	// 		let ch = undefined;
	// 		let code = "";
	// 		let count = 0;
	// 		if (!block.Closed) {
	// 			this.scanner.Push();
	// 			while ((ch = this.scanner.Read()) != undefined) {
	// 				if (ch == block.Bullet) {
	// 					count += 1;
	// 					if (count == block.Count) {
	// 						break;
	// 					}
	// 					continue;
	// 				}

	// 				if (count != 0) {
	// 					code += block.Bullet.repeat(count);
	// 					count = 0;
	// 				}
	// 				code += ch;
	// 			}

	// 			block.Content += code;
	// 		}
	// 	} else {
	// 		// The last block is not a fenced code, so we should check this line is a start of fenced code.
	// 		this.scanner.Push();

	// 		let bullet = this.scanner.Read();
	// 		if (bullet != '`' && bullet != '~') {
	// 			this.scanner.Pop();
	// 			return false;
	// 		}

	// 		let ch = undefined;
	// 		let count = 1;
	// 		while ((ch = this.scanner.Read()) != undefined) {
	// 			if (ch == bullet) {
	// 				count += 1;
	// 			}
	// 		}

	// 		if (count < 3) {
	// 			this.scanner.Pop();
	// 			return false;
	// 		}

	// 		// TODO: Recognize the language of code, but now skip all characters in this line.
	// 		while ((ch = this.scanner.Read()) != '\n');

	// 		this.container.push(new FencedCodeBlock(count, bullet));
	// 	}
	// 	return true;
	// }

	// private parseParagraphBlock(): boolean {
	// 	return false;
	// }

	private IsWhiteSpace(c: string) {
		return c == '\r' || c == '\n';
	}

	private root: Block[] = [];
	private container: Block[] = this.root;
	private scanner: Scanner;
	private buffer: string = "";
}