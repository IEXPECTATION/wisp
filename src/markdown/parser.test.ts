import { Block, BlockQuoteBlock, FencedCodeBlock, HeadingBlock, HrBlock, ParagraphBlock } from "./block";
import { Parser } from "./parser";

it("Parser::Parse", () => {
	let blocks = Parser.Parse("# heading");
	expect(blocks.Blocks.length).toEqual(1);
	expect(blocks.Blocks[0] instanceof HeadingBlock).toEqual(true);
	expect((blocks.Blocks[0] as HeadingBlock).Content).toEqual("heading");
})