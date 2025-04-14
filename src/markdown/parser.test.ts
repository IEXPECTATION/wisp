import { BlockKind, BlockTag, LeafBlock } from "./block";
import { Parser } from "./parser";

test("Parser::Parse", () => {
	const heading = "# Heading";
	let parser = new Parser(heading);

	let blocks = parser.Parse();
	expect(blocks[0].Tag).toBe(BlockTag.Heading);
	expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	expect(blocks.length).toBe(1);
	expect((blocks[0] as LeafBlock).Content).toBe("Heading");

	const hr = "---";
	parser = new Parser(hr);
	blocks = parser.Parse();
	expect(blocks[0].Tag).toBe(BlockTag.Hr);
	expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	expect(blocks.length).toBe(1);
	expect((blocks[0] as LeafBlock).Content).toBe("");

	const hr1 = " - - - ";
	parser = new Parser(hr1);
	blocks = parser.Parse();
	expect(blocks[0].Tag).toBe(BlockTag.Hr);
	expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	expect(blocks.length).toBe(1);
	expect((blocks[0] as LeafBlock).Content).toBe("");

	const hr2 = "***\n";
	parser = new Parser(hr2);
	blocks = parser.Parse();
	expect(blocks[0].Tag).toBe(BlockTag.Hr);
	expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	expect(blocks.length).toBe(1);
	expect((blocks[0] as LeafBlock).Content).toBe("");

	const hr3 = "___";
	parser = new Parser(hr3);
	blocks = parser.Parse();
	expect(blocks[0].Tag).toBe(BlockTag.Hr);
	expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	expect(blocks.length).toBe(1);
	expect((blocks[0] as LeafBlock).Content).toBe("");

	const blankLine = "   ";
	parser = new Parser(blankLine);
	blocks = parser.Parse();
	expect(blocks[0].Tag).toBe(BlockTag.BlankLine);
	expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	expect(blocks.length).toBe(1);
	expect((blocks[0] as LeafBlock).Content).toBe("");

	const blankLine1 = "   \n";
	parser = new Parser(blankLine1);
	blocks = parser.Parse();
	expect(blocks[0].Tag).toBe(BlockTag.BlankLine);
	expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	expect(blocks.length).toBe(1);
	expect((blocks[0] as LeafBlock).Content).toBe("");

	const indentedCode = `	printf("Hello World!);
	return 0;`;
	parser = new Parser(indentedCode);
	blocks = parser.Parse();
	expect(blocks[0].Tag).toBe(BlockTag.IndentedCode);
	expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	expect(blocks.length).toBe(1);
	expect((blocks[0] as LeafBlock).Content).toBe(`printf("Hello World!);
return 0;`);

	const indentedCode1 = `		printf("Hello World!);
		return 0;`;
	parser = new Parser(indentedCode1);
	blocks = parser.Parse();
	expect(blocks[0].Tag).toBe(BlockTag.IndentedCode);
	expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	expect(blocks.length).toBe(1);
	expect((blocks[0] as LeafBlock).Content).toBe(`	printf("Hello World!);
	return 0;`);

	// const fencedCode = "```\nprintf(\"Hello World!\");\n```";
	// parser = new Parser(fencedCode);
	// blocks = parser.Parse();
	// expect(blocks[0].Tag).toBe(BlockTag.FencedCode);
	// expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	// expect(blocks.length).toBe(1);
	// expect((blocks[0] as LeafBlock).Content).toBe("printf(\"Hello World!\");");

	// const fencedCode1 = "~~~\nprintf(\"Hello World!\");\n~~~";
	// parser = new Parser(fencedCode);
	// blocks = parser.Parse();
	// expect(blocks[0].Tag).toBe(BlockTag.FencedCode);
	// expect(blocks[0].Kind).toBe(BlockKind.LeafBlock);
	// expect(blocks.length).toBe(1);
	// expect((blocks[0] as LeafBlock).Content).toBe("printf(\"Hello World!\");");
})