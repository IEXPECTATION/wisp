import { Parser } from "../../src/markdown/parser";
import { HTMLRender } from "../../src/markdown/renderer";

function BlankLine_Testcase1() {
	console.log("BlankLine Testcase 1: Start...")
	let input = "a\n\nb";
	let expectation = `<p>a</p>
<p>b</p>`
	let parser = new Parser();
	let ast = parser.Parse(input);
	let renderer = new HTMLRender();
	let html = renderer.Render(ast);

	if (html == expectation) {
		console.log("BlankLine Testcase 1: Pass");
	} else {
		console.error("expectation:", expectation);
		console.error("result:", html);
		console.error("BlankLine Testcase 1: Fail");
	}
}

export function BlankLine_Testcases() {
	BlankLine_Testcase1();
}