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
	// expect(document.Blocks.length).toEqual(1);
	// expect(document.Blocks[0] instanceof HrBlock).toEqual(true);
	// expect((document.Blocks[0] as HeadingBlock).Content).toEqual("");

	document = Parser.ParseBlock("\n");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof BlankLineBlock).toEqual(true);
	expect((document.Blocks[0] as BlankLineBlock).Content).toEqual("");
})