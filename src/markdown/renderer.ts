import { Node, NodeTag } from "./nodes";
import { EOL } from "os";

interface Render {
  Render(root: Node): string;
}

export class HTMLRender implements Render {
  Render(root: Node) {
    let html = this.visitor(root);
    return html.substring(0, html.length - 1);
  }

  private visitor(target: Node) {
    let text = this.enterNode(target);

    for (let node of target.Children()) {
      text += this.visitor(node);
    }

    text += this.leaveNode(target.Tag);
    return text;
  }

  private enterNode(target: Node) {
    switch (target.Tag) {
      case NodeTag.Document:
        return "";
      case NodeTag.Text:
        return target.Text() ?? "";
      case NodeTag.H1:
        return "<h1>";
      case NodeTag.H2:
        return "<h2>";
      case NodeTag.H3:
        return "<h3>";
      case NodeTag.H4:
        return "<h4>";
      case NodeTag.H5:
        return "<h5>";
      case NodeTag.H6:
        return "<h6>";
      case NodeTag.Hr:
        return "<hr/>";
      case NodeTag.Bold:
        return "<strong>";
      case NodeTag.Italic:
        return "<em>";
      case NodeTag.BlockItalic:
        return "<em><strong>";
      case NodeTag.Code:
        return "<pre><code>";
      case NodeTag.CodeSpan:
        return "<code>" + target.Text();
      case NodeTag.Link:
        return "";
      case NodeTag.BlockQuote:
        return "<blockquote>" + EOL;
      case NodeTag.Paragraph:
        return "<p>";
      case NodeTag.Ol: {
        let startNumber = target.Text();
        if (startNumber != "1") {
          return `<ol start="${startNumber}">${EOL}`;
        }
        return "<ol>" + EOL;
      }
      case NodeTag.Ul:
        return "<ul>" + EOL;
      case NodeTag.Li:
        return "<li>"
      case NodeTag.Image:
        return "";
      case NodeTag.SoftBreak:
        return " ";
      default:
        throw new Error("Unknown node tag!");
    }
  }

  private leaveNode(tag: NodeTag) {
    switch (tag) {
      case NodeTag.Document:
      case NodeTag.Text:
        return "";
      case NodeTag.H1:
        return "</h1>" + EOL;
      case NodeTag.H2:
        return "</h2>" + EOL;
      case NodeTag.H3:
        return "</h3>" + EOL;
      case NodeTag.H4:
        return "</h4>" + EOL;
      case NodeTag.H5:
        return "</h5>" + EOL;
      case NodeTag.H6:
        return "</h6>" + EOL;
      case NodeTag.Hr:
        return EOL;
      case NodeTag.Bold:
        return "</strong>" + EOL;
      case NodeTag.Italic:
        return "</em>" + EOL;
      case NodeTag.BlockItalic:
        return "</strong></em>" + EOL;
      case NodeTag.Code:
        return "</code></pre>" + EOL;
      case NodeTag.CodeSpan:
        return "</code>";
      case NodeTag.Link:
        return "";
      case NodeTag.BlockQuote:
        return "</blockquote>" + EOL;
      case NodeTag.Paragraph:
        return "</p>" + EOL;
      case NodeTag.Ol:
        return "</ol>" + EOL;
      case NodeTag.Ul:
        return "</ul>" + EOL;
      case NodeTag.Li:
        return "</li>" + EOL;
      case NodeTag.Image:
        return "";
      case NodeTag.SoftBreak:
        return "";
      default:
        throw new Error("Unknown node tag!");
    }
  }
}

