import { Parser } from "../../src/markdown/parser";
import { HTMLRender } from "../../src/markdown/renderer";

function Hr_Testcase1() {
	console.log("Hr Testcase 1: Start...")
	let input = "# heading\n---";
	let expectation = `<h1>heading</h1>
<hr/>`
	let parser = new Parser();
	let ast = parser.Parse(input);
	let renderer = new HTMLRender();
	let html = renderer.Render(ast);

	if (html == expectation) {
		console.log("Hr Testcase 1: Pass");
	} else {
		console.error("expectation:", expectation);
		console.error("result:", html);
		console.error("Hr Testcase 1: Fail");
	}
}

export function Hr_Testcases() {
	Hr_Testcase1();
}