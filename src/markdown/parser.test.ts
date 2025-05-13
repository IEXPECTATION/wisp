import { Block, BlockQuoteBlock, FencedCodeBlock, HeadingBlock, HrBlock, ParagraphBlock } from "./block";
import { Parser } from "./parser";
import { Scanner } from "./scanner";

it("Parser::Parse", () => {
	let input = "   # Heading";
	let parser = new Parser(new Scanner(input));
	let document = parser.Parse();
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof HeadingBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("Heading");

	input = "   #	Heading";
	parser = new Parser(new Scanner(input));
	document = parser.Parse();
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof HeadingBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("Heading");


	input = "   # Heading\n - - -\n   # Heading";
	parser = new Parser(new Scanner(input));
	document = parser.Parse();
	expect(document.Blocks.length).toEqual(3);
	expect(document.Blocks[0] instanceof HeadingBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("Heading");
	expect(document.Blocks[1] instanceof HrBlock).toEqual(true);
	expect((document.Blocks[1] as HrBlock).Content).toEqual("");
	expect(document.Blocks[2] instanceof HeadingBlock).toEqual(true);
	expect((document.Blocks[2] as HeadingBlock).Content).toEqual("Heading");

	input = "   ~~~\n     abc\n~~~~";
	parser = new Parser(new Scanner(input));
	document = parser.Parse();
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof FencedCodeBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("  abc\n");

	input = "this is a simple text";
	parser = new Parser(new Scanner(input));
	document = parser.Parse();
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof ParagraphBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("this is a simple text");

	input = "\n";
	parser = new Parser(new Scanner(input));
	document = parser.Parse();
	expect(document.Blocks.length).toEqual(1);

	input = "> # heading";
	parser = new Parser(new Scanner(input));
	document = parser.Parse();
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof BlockQuoteBlock).toEqual(true);
	expect((document.Blocks[0] as BlockQuoteBlock).Blocks[0] instanceof HeadingBlock).toEqual(true);
	expect(((document.Blocks[0] as BlockQuoteBlock).Blocks[0] as HeadingBlock).Content).toEqual("heading");

	input = "> this is a paragraph\nthis is another paragraph";
	parser = new Parser(new Scanner(input));
	document = parser.Parse();
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof BlockQuoteBlock).toEqual(true);
	expect((document.Blocks[0] as BlockQuoteBlock).Blocks[0] instanceof ParagraphBlock).toEqual(true);
	expect(((document.Blocks[0] as BlockQuoteBlock).Blocks[0] as ParagraphBlock).Content).toEqual("this is a paragraph\nthis is another paragraph");

	// input = "> this is a paragraph\nthis is another paragraph\n\nHere is a paragraph too";
	// parser = new Parser(new Scanner(input));
	// document = parser.Parse();
	// expect(document.Blocks.length).toEqual(2);
	// expect(document.Blocks[0] instanceof BlockQuoteBlock).toEqual(true);
	// console.dir(document, { depth: Infinity });

	input = ">		code block";
	parser = new Parser(new Scanner(input));
	document = parser.Parse();
	console.dir(document, { depth: Infinity });
})