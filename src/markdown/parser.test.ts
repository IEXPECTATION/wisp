import { NODETAG, Node, NodeTag } from "./node";
import { Parser } from "./parser"
import { Scanner } from "./scanner";

function nodetag_dfs(node: Node, node_tags: { "tag": NodeTag, "depth": number }[]): void {
  let index = 0;
  function dfs_helper(node: Node, node_tags: { "tag": NodeTag, "depth": number }[], depth: number) {
    if (node.tag != NODETAG.Document) {
      expect(node.element?.is_open()).toEqual(false);
    }
    expect(node.tag).toEqual(node_tags[index]["tag"]);
    expect(depth).toEqual(node_tags[index]["depth"]);
    index += 1;
    for (let child of node.get_children()) {
      dfs_helper(child, node_tags, depth + 1);
    }
  }
  dfs_helper(node, node_tags, 0);
  expect(index).toEqual(node_tags.length);
}

function node_content_dfs(node: Node, node_contents: string[]): void {
  let index = 0;
  function dfs_helper(node: Node, node_contents: string[]) {
    if (node.is_left_block()) {
      //  TODO: Check the content of node.
      index += 1;
      for (let child of node.get_children()) {
        dfs_helper(child, node_contents);
      }
    }
  }
  dfs_helper(node, node_contents);
}

test("paragraph test I", () => {
  const input = "> abc\n>\n> def";
  const scanner = new Scanner(input);
  const p = new Parser(scanner);
  const root = p.parse();
  console.dir(root, {depth: Infinity});
  expect(root instanceof Node).toEqual(true);
  if (root instanceof Node) {
    nodetag_dfs(root,
      [{ "tag": NODETAG.Document, "depth": 0 },
      { "tag": NODETAG.BlockQuote, "depth": 1 },
      { "tag": NODETAG.Paragraph, "depth": 2 },
      { "tag": NODETAG.Paragraph, "depth": 2 }]);
  }
});

// test("paragraph test II", () => {
//   const input = "> abc\n> def";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   // console.dir(root, {depth: Infinity});
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root,
//       [{ "tag": NODETAG.Document, "depth": 0 },
//       { "tag": NODETAG.BlockQuote, "depth": 1 },
//       { "tag": NODETAG.Paragraph, "depth": 2 }]);
//   }
// });
//
// test("paragraph test III", () => {
//   const input = "pargraph I\n    paragraph II";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   // console.dir(root, {depth: Infinity});
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root, [{ "tag": NODETAG.Document, "depth": 0 }, { "tag": NODETAG.Paragraph, "depth": 1 }]);
//   }
// });
//
// test("paragraph test IV", () => {
//   const input = "> pargraph I\n # Heading";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   // console.dir(root, {depth: Infinity});
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root,
//       [{ "tag": NODETAG.Document, "depth": 0 },
//       { "tag": NODETAG.BlockQuote, "depth": 1 },
//       { "tag": NODETAG.Paragraph, "depth": 2 },
//       { "tag": NODETAG.Heading, "depth": 1 }]);
//   }
// });
//
// test("blockquote test I", () => {
//   const input = "> abc\n>> def\n";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   // console.dir(root, {depth: Infinity});
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root,
//       [{ "tag": NODETAG.Document, "depth": 0 },
//       { "tag": NODETAG.BlockQuote, "depth": 1 },
//       { "tag": NODETAG.Paragraph, "depth": 2 },
//       { "tag": NODETAG.BlockQuote, "depth": 2 },
//       { "tag": NODETAG.Paragraph, "depth": 3 }]);
//   }
// });
//
// test("blockquote test II", () => {
//   const input = "> abc\n>> def\n> igh\n";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   // console.dir(root, { depth: Infinity });
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root,
//       [{ "tag": NODETAG.Document, "depth": 0 },
//       { "tag": NODETAG.BlockQuote, "depth": 1 },
//       { "tag": NODETAG.Paragraph, "depth": 2 },
//       { "tag": NODETAG.BlockQuote, "depth": 2 },
//       { "tag": NODETAG.Paragraph, "depth": 3 }]);
//   }
// });
//
// test("blockquote test III", () => {
//   const input = "> abc\n>> def\n> igh\n>>> jkl";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   // console.dir(root, {depth: Infinity});
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root,
//       [{ "tag": NODETAG.Document, "depth": 0 },
//       { "tag": NODETAG.BlockQuote, "depth": 1 },
//       { "tag": NODETAG.Paragraph, "depth": 2 },
//       { "tag": NODETAG.BlockQuote, "depth": 2 },
//       { "tag": NODETAG.Paragraph, "depth": 3 },
//       { "tag": NODETAG.BlockQuote, "depth": 3 },
//       { "tag": NODETAG.Paragraph, "depth": 4 }]);
//   }
// });
//
// test("indented test I", () => {
//   const input = "    indent code";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   // console.dir(root, { depth: Infinity });
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root,
//       [{ "tag": NODETAG.Document, "depth": 0 },
//       { "tag": NODETAG.IndentedCode, "depth": 1 }]);
//   }
// });
//
// test("indented test II", () => {
//   const input = "    indented code I\n      indented code II";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   // console.dir(root, { depth: Infinity });
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root,
//       [{ "tag": NODETAG.Document, "depth": 0 },
//       { "tag": NODETAG.IndentedCode, "depth": 1 }]);
//   }
// });
//
// test("indented test III", () => {
//   const input = "# Heading\n      indented code II";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   // console.dir(root, { depth: Infinity });
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root,
//       [{ "tag": NODETAG.Document, "depth": 0 },
//       { "tag": NODETAG.Heading, "depth": 1 },
//       { "tag": NODETAG.IndentedCode, "depth": 1 }]);
//   }
// });
//
// test("Fenced code I", () => {
//   const input = "```\nfenced code I\n```";
//   const scanner = new Scanner(input);
//   const p = new Parser(scanner);
//   const root = p.parse();
//   console.dir(root, { depth: Infinity });
//   expect(root instanceof Node).toEqual(true);
//   if (root instanceof Node) {
//     nodetag_dfs(root,
//       [{ "tag": NODETAG.Document, "depth": 0 },
//       { "tag": NODETAG.FencedCode, "depth": 1 }]);
//   }
// });
