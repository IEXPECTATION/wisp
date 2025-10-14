import { Heading } from "./block";
import { HtmlBlockProcessor, HeadingProcessor, BlockQuoteProcessor } from "./processor";
import { Scanner } from "./scanner";

test("BlockQuote::open", () => {
  let input = "> abc";
  const bpp = new BlockQuoteProcessor();
  let b = bpp.open(new Scanner(input));
  console.log(`b = ${b?.is_open()}`);
  expect(b).not.toBe(null);

  input = ">> abc";
  let scanner = new Scanner(input);
  b = bpp.open(scanner);
  expect(b).not.toBe(null);
  b = bpp.open(scanner);
  expect(b).not.toBe(null);
})

test("HeadingProcessor::open", () => {
  let input = "# demo heading";
  const hp = new HeadingProcessor();
  let b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b as Heading).level).toEqual(1);
  expect((b as Heading).content).toEqual("demo heading");

  input = "## demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b as Heading).level).toEqual(2);
  expect((b as Heading).content).toEqual("demo heading");

  input = "### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b as Heading).level).toEqual(3);
  expect((b as Heading).content).toEqual("demo heading");

  input = "#### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b as Heading).level).toEqual(4);
  expect((b as Heading).content).toEqual("demo heading");

  input = "##### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b as Heading).level).toEqual(5);
  expect((b as Heading).content).toEqual("demo heading");

  input = "###### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b as Heading).level).toEqual(6);
  expect((b as Heading).content).toEqual("demo heading");

  input = "####### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).toBe(null);
})

