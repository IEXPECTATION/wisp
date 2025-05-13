export class Scanner {
	constructor(input: string) {
		this.input = input;
	}

	End(): boolean {
		return this.position == this.input.length;
	}

	Read(): string | undefined {
		if (this.position < this.input.length) {
			let c = this.input[this.position];
			this.position += 1;
			return c;
		}
		return undefined;
	}

	static IsEol(c: string) {
		return c == '\n' || c == '\r';
	}

	static IsWhiteSpace(c: string) {
		return c == '\t' || c == ' ';
	}

	private position: number = 0;
	private input: string;
};

