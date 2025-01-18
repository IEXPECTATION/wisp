import { Parser } from "../../src/markdown/parser";
import { HTMLRender } from "../../src/markdown/renderer";

function Heading_Testcase1() {
  console.log("Heading Testcase 1: Start...")
  let input = "# heading";
  let expectation = "<h1>heading</h1>";
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


export function Heading_Test() {
  Heading_Testcase1();
}