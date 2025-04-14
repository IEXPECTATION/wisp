import { Scanner } from './scanner'

test("Scanner::Read", () => {
	const input = "This is a test information!";
	const scanner = new Scanner(input);
	let expected = "";

	let ch = undefined;
	while (ch = scanner.Read()) {
		expected += ch;
	}

	expect(expected).toBe(input);
});

test("Scanner::Peek", () => {
	const input = "This is a test information!";
	const scanner = new Scanner(input);
	expect(scanner.Peek()).toBe('T');
});

test("Scanner::Consume", () => {
	const input = "AB";
	const scanner = new Scanner(input);

	expect(scanner.Consume('A')).toBe(true);
	expect(scanner.Consume('A')).toBe(false);
});

test("Scanner::End", () => {
	const input = "ABC";
	const scanner = new Scanner(input);

	expect(scanner.End()).toBe(false);
	while (scanner.Read());
	expect(scanner.End()).toBe(true);
});

test("Scanner::ReadLine", () => {
	const input = "Here is a test line.";
	const scanner = new Scanner(input);

	expect(scanner.ReadLine()).toBe(input);
})