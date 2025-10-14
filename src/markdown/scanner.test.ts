import { ArriveEndOfInput, Scanner } from "./scanner";

test("Common Test", () => {
  const input = "Here is a demo input.";
  const scanner = new Scanner(input);
  const peek_line = scanner.peekline();
  expect(peek_line).toEqual(input);

  scanner.advance();
  const peek_line2 = scanner.peekline();
  expect(peek_line2).toEqual(input.substring(1));
})
