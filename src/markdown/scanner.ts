export class Scanner {
	constructor(input: string) {
		this.input = input;
	}

	End(): boolean {
		return this.position == this.input.length;
	}

	Read(): string | undefined {
		if (this.position < this.input.length) {
			let ch = this.input[this.position];
			this.position += 1;
			return ch;
		}
		return undefined;
	}

	ReadLine(): string {
		let line = "";
		let ch = undefined;
		while ((ch = this.Read()) != undefined) {
			line += ch;

			if (ch == '\n') {
				break;
			}
		}
		return line;
	}

	Peek(): string | undefined {
		if (this.position < this.input.length) {
			return this.input[this.position];
		}
		return undefined;
	}

	Consume(ch: string): boolean {
		if (ch == this.Peek()) {
			this.position += 1;
			return true;
		}
		return false;
	}

	private position: number = 0;
	private positions: number[] = [];
	private input: string;
};