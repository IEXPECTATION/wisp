class lineBuffer {
	constructor(buffer: string) {
		this.buffer = buffer;
	}

	Peek(position: number): string {
		console.assert(position < this.buffer.length);
		return this.buffer[position];
	}

	Length(): number {
		return this.buffer.length;
	}

	private buffer: string;
};

export class Scanner {
	constructor(input: string) {
		this.input = input;
		this.Buffer = this.readLine();
	}

	End(): boolean {
		return this.position == this.input.length;
	}

	Readline(): void {
		this.Buffer = this.readLine();
	}

	static IsEOL(c: string) {
		return c == '\n' || c == '\r';
	}

	static IsWhiteSpace(c: string) {
		return c == ' ' || c == '\t';
	}

	Buffer: lineBuffer;

	private readLine(): lineBuffer {
		let buffer = "";
		while (this.position < this.input.length) {
			let c = this.input[this.position];
			if (Scanner.IsEOL(c)) {
				let eol = c;
				this.position += 1;
				c = this.input[this.position];
				if (eol != c && Scanner.IsEOL(c)) {
					eol += c;
				}
				buffer += eol;
				break;
			}

			this.position += 1;
			buffer += c;
		}
		return new lineBuffer(buffer);
	}

	private input: string;
	private position: number = 0;
}