import { BlockQuote, Heading } from "./block";
import { BlockQuoteProcessor, HeadingProcessor, HtmlBlockProcessor } from "./processor";
import { Scanner } from "./scanner";

test("BlockQuote::open", () => {
  let input = "> abc";
  const bpp = new BlockQuoteProcessor();
  let b = bpp.open(new Scanner(input));
  expect(b).not.toBe(null);
  // expect((b?.element as unknown as BlockQuote).begin).toEqual(0);
  // expect((b?.element as unknown as BlockQuote).end).toEqual(2);

  input = ">> abc";
  let scanner = new Scanner(input);
  b = bpp.open(scanner);
  expect(b).not.toBe(null);
  // expect((b?.element as unknown as BlockQuote).begin).toEqual(0);
  // expect((b?.element as unknown as BlockQuote).end).toEqual(1);
  b = bpp.open(scanner);
  expect(b).not.toBe(null);
  // expect((b?.element as unknown as BlockQuote).begin).toEqual(1);
  // expect((b?.element as unknown as BlockQuote).end).toEqual(3);
})

test("HeadingProcessor::open", () => {
  let input = "# demo heading";
  const hp = new HeadingProcessor();
  let b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b?.element as unknown as Heading).level).toEqual(1);
  expect((b?.element as unknown as Heading).content).toEqual("demo heading");
  // expect((b?.element as unknown as Heading).begin).toEqual(0);
  // expect((b?.element as unknown as Heading).end).toEqual(input.length);

  input = "## demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b?.element as unknown as Heading).level).toEqual(2);
  expect((b?.element as unknown as Heading).content).toEqual("demo heading");
  // expect((b?.element as unknown as Heading).begin).toEqual(0);
  // expect((b?.element as unknown as Heading).end).toEqual(input.length);

  input = "### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b?.element as unknown as Heading).level).toEqual(3);
  expect((b?.element as unknown as Heading).content).toEqual("demo heading");
  // expect((b?.element as unknown as Heading).begin).toEqual(0);
  // expect((b?.element as unknown as Heading).end).toEqual(input.length);

  input = "#### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b?.element as unknown as Heading).level).toEqual(4);
  expect((b?.element as unknown as Heading).content).toEqual("demo heading");
  // expect((b?.element as unknown as Heading).begin).toEqual(0);
  // expect((b?.element as unknown as Heading).end).toEqual(input.length);

  input = "##### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b?.element as unknown as Heading).level).toEqual(5);
  expect((b?.element as unknown as Heading).content).toEqual("demo heading");
  // expect((b?.element as unknown as Heading).begin).toEqual(0);
  // expect((b?.element as unknown as Heading).end).toEqual(input.length);

  input = "###### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b?.element as unknown as Heading).level).toEqual(6);
  expect((b?.element as unknown as Heading).content).toEqual("demo heading");
  // expect((b?.element as unknown as Heading).begin).toEqual(0);
  // expect((b?.element as unknown as Heading).end).toEqual(input.length);

  input = "###### demo heading\n";
  b = hp.open(new Scanner(input));
  expect(b).not.toBe(null);
  expect((b?.element as unknown as Heading).level).toEqual(6);
  expect((b?.element as unknown as Heading).content).toEqual("demo heading");
  // expect((b?.element as unknown as Heading).begin).toEqual(0);
  // expect((b?.element as unknown as Heading).end).not.toEqual(input.length);
  // expect((b?.element as unknown as Heading).end).toEqual(input.length - 1);


  input = "####### demo heading";
  b = hp.open(new Scanner(input));
  expect(b).toBe(null);
})

