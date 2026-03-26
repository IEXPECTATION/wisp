import { Scanner } from "./scanner";


test("testcase I", () => {
  const input = "This is a test paragraph.";
  const scanner = new Scanner(input);
  expect(scanner.peek).toEqual('T');
  expect(scanner.get_position()).toEqual(0);
  expect(scanner.consume_if('T')).toEqual(true);
  expect(scanner.get_position()).toEqual(1);
  expect(scanner.peek).toEqual('h');
});

test("testcase II", () => {
  const input = "    This is a test paragraph.";
  const scanner = new Scanner(input);
  expect(scanner.indent).toEqual(4);
})

