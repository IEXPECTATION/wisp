import { Parser } from "../../src/markdown/parser";
import { HTMLRender } from "../../src/markdown/renderer";

function FencedCode_Testcase1() {
  console.log("FencedCode Testcase 1: Start...")
  let input = "```\nabc\n```";
  let expectation = `<pre><code>abc
</code></pre>`
  let parser = new Parser();
  let ast = parser.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);

  if (html == expectation) {
    console.log("FencedCode Testcase 1: Pass");
  } else {
    console.error("expectation:", expectation);
    console.error("result:", html);
    console.error("FencedCode Testcase 1: Fail");
  }
}

export function FencedCode_Testcases() {
  FencedCode_Testcase1();
}