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
  // let input = "> abc\n>> abc\n>>> abc\n>>>> abc";

  let pasrer = new Parser({});
  let ast = pasrer.Parse(input);
  let renderer = new HTMLRender();
  let html = renderer.Render(ast);
  console.log(html);
}


(() => {
  RendererTestcase4ParagraphI()
})();