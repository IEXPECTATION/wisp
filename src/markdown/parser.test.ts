import { NODE_TAG, Node, NodeTag } from "./node";
import { Parser } from "./parser"
import { Scanner } from "./scanner";

function check_node_dfs(node: Node, node_info: { "tag": NodeTag, "depth": number, content?: string }[]): void {
  let index = 0;
  function dfs_helper(node: Node, node_info: { "tag": NodeTag, "depth": number, content?: string }[], depth: number) {
    if (node.tag != NODE_TAG.Document) {
      expect(node.element?.is_open()).toEqual(false);
    }
    expect(node.tag).toEqual(node_info[index]["tag"]);
    expect(depth).toEqual(node_info[index]["depth"]);
    index += 1;
    for (let child of node.get_children()) {
      dfs_helper(child, node_info, depth + 1);
    }
  }
  dfs_helper(node, node_info, 0);
  expect(index).toEqual(node_info.length);
}

test("paragraph test I", () => {
  const input = "> abc\n>\n> def";
  const scanner = new Scanner(input);
  const p = new Parser(scanner);
  const root = p.parse();
  console.dir(root, { depth: Infinity });
  expect(root instanceof Node).toEqual(true);
  if (root instanceof Node) {
    check_node_dfs(root,
      [{ "tag": NODE_TAG.Document, "depth": 0 },
      { "tag": NODE_TAG.BlockQuote, "depth": 1 },
      { "tag": NODE_TAG.Paragraph, "depth": 2 },
      { "tag": NODE_TAG.Paragraph, "depth": 2 }]);
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
