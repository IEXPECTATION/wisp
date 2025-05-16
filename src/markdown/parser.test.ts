import { Block, BlockQuoteBlock, FencedCodeBlock, HeadingBlock, HrBlock, ParagraphBlock } from "./blocks";
import { Parser } from "./parser";

it("Parser::Parse", () => {
	let document = Parser.Parse("# heading");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof HeadingBlock).toEqual(true);
	expect((document.Blocks[0] as HeadingBlock).Content).toEqual("heading");

	document = Parser.Parse("> # heading");
	expect(document.Blocks.length).toEqual(1);
	expect(document.Blocks[0] instanceof BlockQuoteBlock).toEqual(true);
	expect((document.Blocks[0] as BlockQuoteBlock).Blocks[0] instanceof HeadingBlock).toEqual(true);
	expect(((document.Blocks[0] as BlockQuoteBlock).Blocks[0] as HeadingBlock).Content).toEqual("heading");

	document = Parser.Parse("    console.log(\"Hello World!\");\n     return;")
	console.dir(document, {depth: Infinity});
})