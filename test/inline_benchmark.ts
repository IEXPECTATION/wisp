import { Markdown } from "../src/markdown";

module Test {
  function Inline1(ast: Markdown.Element) {
    let fn = (element: Markdown.Element) => {
      if (element.Tag == Markdown.ElementTags.Headings || element.Tag == Markdown.ElementTags.Blodqoutes ||
        element.Tag == Markdown.ElementTags.Lists || element.Tag == Markdown.ElementTags.Paragraphs || element.Tag == Markdown.ElementTags.Emphasis) {
        element.Children.push(new Markdown.TextElement(element.Text));

        Markdown.Emphasis(element);
      }
    };

    Markdown.Walk(ast, fn);
    return ast;
  }

  function Inline2(ast: Markdown.Element) {
    let fn = (element: Markdown.Element) => {
      if (element.Tag == Markdown.ElementTags.Headings || element.Tag == Markdown.ElementTags.Blodqoutes ||
        element.Tag == Markdown.ElementTags.Lists || element.Tag == Markdown.ElementTags.Paragraphs || element.Tag == Markdown.ElementTags.Emphasis) {
        let text = element.Text;
        let begin = 0, end = 0;
        while (end < text.length) {
        }
      }
    };

    Markdown.Walk(ast, fn);
    return ast;
  }

  const small1 = "This is *a* small-sized text case."
  const small2 = "*This* is *a* **small-sized** text case."
  const small3 = "*This* is *a* **small-sized** *text* *case*."

  const medium1 = `This is *a* medium-sized text example. I'm *considering* which approach I should employ.
One *method* involves *traversing* the string and checking if the current character is a special element.
Then, invoke the corresponding function to handle them.
Another approach I'm considering is to directly apply special character functions to the entire text.
Each function will be responsible for identifying and handling its designated special characters.`
  const medium2 = "This is *a* medium text case. "
  const medium3 = "This is *a* medium text case. "

  const large1 = ""
  const large2 = ""
  const large3 = ""

  export function Benchmark() {

  }
}

Test.Benchmark()