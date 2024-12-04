import { Parser } from "../../../dist/src/markdown/parser.js";
import { HTMLRender } from "../../../dist/src/markdown/renderer.js";

const parser = new Parser({});
const renderer = new HTMLRender();

let context = {
  WriteHtmlElements: () => {
  },
  CallMarkdownParser: (input) => {
    let ast = parser.Parse(input);
    let document = renderer.Render(ast);
  },

  Render: (html) => {
    let product = context.findProductNode();

  }
}
