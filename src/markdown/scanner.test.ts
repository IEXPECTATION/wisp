import { Scanner } from "./scanner";

it("Scanner::End", () => {
	const text = "ABC";
	const scanner = new Scanner(text);
	while (scanner.Read() != undefined) {
		;
	}

	expect(scanner.End()).toEqual(true);
})