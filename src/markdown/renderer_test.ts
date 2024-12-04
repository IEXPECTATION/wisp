import { Parser } from "./parser";
import { HTMLRender } from "./renderer";

function RendererTestcase4HeadingI() {
  let input = "# Heading1";
  let pasrer = new Parser({});
  let ast = pasrer.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);
  console.log(html);
}

function RendererTestcase4ParagraphI() {
  let input = "# Paragraph Test\n This is a line `  tes\nt`` ` `paragraph`.";
//   let input = `
// > line 1
// line 1 continuation text
// > line 2
// line 2 continuation text
// > line 3
// line 3 continuation text
// > line 4
// line 4 continuation text
// > line 5
// line 5 continuation text
// > line 6
// line 6 continuation text
// > line 7
// line 7 continuation text
// > line 8
// line 8 continuation text
// > line 9
// line 9 continuation text
// > line 10
// line 10 continuation text
// > line 11
// line 11 continuation text
// > line 12
// line 12 continuation text
// > line 13
// line 13 continuation text
// > line 13
// line 13 continuation text
// > line 14
// line 14 continuation text
// > line 14
// line 14 continuation text
// > line 15
// line 15 continuation text
// > line 16
// line 16 continuation text
// > line 17
// line 17 continuation text
// > line 18
// line 18 continuation text
// > line 19
// line 19 continuation text
// > line 20
// line 20 continuation text
// > line 21
// line 21 continuation text
// > line 22
// line 22 continuation text
// > line 23
// line 23 continuation text
// > line 24
// line 24 continuation text
// > line 25
// line 25 continuation text
// `;

  let pasrer = new Parser({});
  let ast = pasrer.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);
  console.log(html);
}


(() => {
  RendererTestcase4ParagraphI()
})();