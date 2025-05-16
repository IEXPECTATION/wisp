import { BlankLineBlock, BlockQuoteBlock, FencedCodeBlock, HeadingBlock, HrBlock, IndentedCodeBlock, ParagraphBlock } from "./blocks";
import { Parser } from "./parser";

it("Parser::Parse", () => {
	let document = Parser.ParseBlock("# heading");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof HeadingBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("heading");

	document = Parser.ParseBlock("> # heading");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof BlockQuoteBlock).toEqual(true);
	expect((document.Blocks[0] as BlockQuoteBlock).Blocks[0] instanceof HeadingBlock).toEqual(true);
	expect(((document.Blocks[0] as BlockQuoteBlock).Blocks[0] as HeadingBlock).Content).toEqual("heading");

	document = Parser.ParseBlock("    console.log(\"Hello World!\");\n    \n     return;")
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof IndentedCodeBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("console.log(\"Hello World!\");\n\n return;");

	document = Parser.ParseBlock("   * * *\n");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof HrBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("");

	document = Parser.ParseBlock("   ___\n");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof HrBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("");

	document = Parser.ParseBlock("   ---\n");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof HrBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("");

	document = Parser.ParseBlock("   -_-\n");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof ParagraphBlock).toEqual(true);
	expect((document.Blocks[0] as ParagraphBlock).Content).toEqual("-_-\n");

	document = Parser.ParseBlock("\n");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof BlankLineBlock).toEqual(true);
	expect((document.Blocks[0] as BlankLineBlock).Content).toEqual("");

	document = Parser.ParseBlock(`~~~ c
printf("Hello World!");
return 0;
~~~`);
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof FencedCodeBlock).toEqual(true);
	expect((document.Blocks[0] as FencedCodeBlock).Content).toEqual("printf(\"Hello World!\");\nreturn 0;\n");

	document = Parser.ParseBlock("> a paragraph\nanother paragraph\n");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof BlockQuoteBlock).toEqual(true);
	expect((document.Blocks[0] as BlockQuoteBlock).Blocks[0] instanceof ParagraphBlock).toEqual(true);
	expect(((document.Blocks[0] as BlockQuoteBlock).Blocks[0] as ParagraphBlock).Content).toEqual("a paragraph\nanother paragraph\n");

	document = Parser.ParseBlock("> a paragraph\n# heading");
	expect(document.Blocks.length).toEqual(2);
	expect(document.Blocks[0] instanceof BlockQuoteBlock).toEqual(true);
	expect((document.Blocks[0] as BlockQuoteBlock).Blocks[0] instanceof ParagraphBlock).toEqual(true);
	expect(((document.Blocks[0] as BlockQuoteBlock).Blocks[0] as ParagraphBlock).Content).toEqual("a paragraph\n");
	expect(document.Blocks[1] instanceof HeadingBlock).toEqual(true);
	expect((document.Blocks[1] as HeadingBlock).Content).toEqual("heading");
})