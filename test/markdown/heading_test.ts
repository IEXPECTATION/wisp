import { Parser } from "../../src/markdown/parser.js";
import { HTMLRender } from "../../src/markdown/renderer";

function Heading_Testcase1() {
	console.log("Heading Testcase 1: Start...")
	let input = "# Heading\n";
	let expectation = "<h1>Heading</h1>";
	let parser = new Parser();
	let ast = parser.Parse(input);
	let renderer = new HTMLRender();
	let html = renderer.Render(ast);

	if (html == expectation) {
		console.log("Heading Testcase 1: Pass");
	} else {
		console.error("expectation:", expectation);
		console.error("result:", html);
		console.error("Heading Testcase 1: Fail");
	}
}

function Heading_Testcase2() {
	console.log("Heading Testcase 2: Start...")
	let input = "Heading\n===\n";
	let expectation = "<h1>Heading</h1>";
	let parser = new Parser();
	let ast = parser.Parse(input);
	let renderer = new HTMLRender();
	let html = renderer.Render(ast);

	if (html == expectation) {
		console.log("Heading Testcase 2: Pass");
	} else {
		console.error("expectation:", expectation);
		console.error("result:", html);
		console.error("Heading Testcase 2: Fail");
	}
}

function Heading_Testcase3() {
	console.log("Heading Testcase 3: Start...")
	let input = "Heading\n---\n";
	let expectation = "<h2>Heading</h2>";
	let parser = new Parser();
	let ast = parser.Parse(input);
	let renderer = new HTMLRender();
	let html = renderer.Render(ast);

	if (html == expectation) {
		console.log("Heading Testcase 3: Pass");
	} else {
		console.error("expectation:", expectation);
		console.error("result:", html);
		console.error("Heading Testcase 3: Fail");
	}
}

function Heading_Testcase4() {
	console.log("Heading Testcase 4: Start...")
	let input = "## Heading          \n";
	let expectation = "<h2>Heading</h2>";
	let parser = new Parser();
	let ast = parser.Parse(input);
	let renderer = new HTMLRender();
	let html = renderer.Render(ast);

	if (html == expectation) {
		console.log("Heading Testcase 4: Pass");
	} else {
		console.error("expectation:", expectation);
		console.error("result:", html);
		console.error("Heading Testcase 4: Fail");
	}
}

function Heading_Testcase5() {
	console.log("Heading Testcase 5: Start...")
	let input = "## Heading  \t \t       \n";
	let expectation = "<h2>Heading</h2>";
	let parser = new Parser();
	let ast = parser.Parse(input);
	let renderer = new HTMLRender();
	let html = renderer.Render(ast);

	if (html == expectation) {
		console.log("Heading Testcase 5: Pass");
	} else {
		console.error("expectation:", expectation);
		console.error("result:", html);
		console.error("Heading Testcase 5: Fail");
	}
}


export function Heading_Testcases() {
	Heading_Testcase1();
	Heading_Testcase2();
	Heading_Testcase3();
	Heading_Testcase4();
	Heading_Testcase5();
}

