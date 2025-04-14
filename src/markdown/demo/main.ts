import { assert } from "node:console";
import { readFile } from "node:fs/promises";
import { Parser } from "../parser";
import { HTMLRender } from "../renderer";

async function markdown(path: string) {
	assert(path != "");

	const content = await readFile(path, 'utf-8');
	const parser = new Parser();
	const renderer = new HTMLRender();
	return renderer.Render(parser.Parse(content));
}

(() => {
	markdown("/home/wuch/dev/wisp/drafts/lectures1.md")
		.then((html: string) => {
			console.log(html);
		});
})();