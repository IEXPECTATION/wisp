// import { Parser } from "./parser";
// import { BlockQuoteToken, FencedCodeToen, HeadingToken, IndentedCodeToken, ReferenceToken, TokenKind } from "./tokens";

// function parserBlankLineTestcase1() {
//   let input = "     ";
//   let parser = new Parser({});
//   console.info("< parserBlankLineTestcase1 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.BlankLine) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< parserBlankLineTestcase1 >");
// }

// // Heading
// function parserHeadingTestcase1() {
//   let input = "# heading\n   \tasd\n\t   a";
//   let parser = new Parser({});
//   console.info("< ParserHeadingTestcase1 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as HeadingToken).Kind == TokenKind.Heading &&
//       (tokens[0] as HeadingToken).Level == 1 &&
//       (tokens[0] as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserHeadingTestcase1 >");
// }

// function parserHeadingTestcase2() {
//   let input = "## heading";
//   let parser = new Parser({});
//   console.info("< ParserHeadingTestcase2 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as HeadingToken).Kind == TokenKind.Heading &&
//       (tokens[0] as HeadingToken).Level == 2 &&
//       (tokens[0] as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserHeadingTestcase2 >");
// }

// function parserHeadingTestcase3() {
//   let input = "### heading";
//   let parser = new Parser({});
//   console.info("< ParserHeadingTestcase3 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as HeadingToken).Kind == TokenKind.Heading &&
//       (tokens[0] as HeadingToken).Level == 3 &&
//       (tokens[0] as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserHeadingTestcase3 >");
// }

// function parserHeadingTestcase4() {
//   let input = "#### heading";
//   let parser = new Parser({});
//   console.info("< ParserHeadingTestcase4 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###")
//   } else {
//     if ((tokens[0] as HeadingToken).Kind == TokenKind.Heading &&
//       (tokens[0] as HeadingToken).Level == 4 &&
//       (tokens[0] as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserHeadingTestcase4 >");
// }

// function parserHeadingTestcase5() {
//   let input = "##### heading";
//   let parser = new Parser({});
//   console.info("< ParserHeadingTestcase5 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as HeadingToken).Kind == TokenKind.Heading &&
//       (tokens[0] as HeadingToken).Level == 5 &&
//       (tokens[0] as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserHeadingTestcase5 >");
// }

// function parserHeadingTestcase6() {
//   let input = "###### heading";
//   let parser = new Parser({});
//   console.info("< ParserHeadingTestcase6 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as HeadingToken).Kind == TokenKind.Heading &&
//       (tokens[0] as HeadingToken).Level == 6 &&
//       (tokens[0] as HeadingToken).Text == "heading") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserHeadingTestcase6 >");
// }

// // Block Quote
// function parserBlockQuoteTestcase1() {
//   let input = "> # Heading";
//   let parser = new Parser({});
//   console.info("< ParserBlockQuoteTestcase1 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as BlockQuoteToken).Kind == TokenKind.BlockQuote &&
//       (tokens[0] as BlockQuoteToken).Tokens[0].Kind == TokenKind.Heading) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserBlockQuoteTestcase1 >");
// }

// function parserBlockQuoteTestcase2() {
//   let input = ">>";
//   let parser = new Parser({});
//   console.info("< ParserBlockQuoteTestcase2 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as BlockQuoteToken).Kind == TokenKind.BlockQuote &&
//       (tokens[0] as BlockQuoteToken).Tokens[0].Kind == TokenKind.BlockQuote) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserBlockQuoteTestcase2 >");
// }

// function parserBlockQuoteTestcase3() {
//   let input = ">     code line 1";
//   let parser = new Parser({});
//   console.info("< ParserBlockQuoteTestcase3 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as BlockQuoteToken).Kind == TokenKind.BlockQuote &&
//       (tokens[0] as BlockQuoteToken).Tokens[0].Kind == TokenKind.IndentedCode &&
//       (((tokens[0] as BlockQuoteToken).Tokens[0]) as IndentedCodeToken).Code == "code line 1") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserBlockQuoteTestcase3 >");
// }

// // Indented Code
// function parserIndentedCodeTestcase1() {
//   let input = "    indented code";
//   let parser = new Parser({});
//   console.info("< ParserIndentedCodeTestcase1 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as IndentedCodeToken).Kind == TokenKind.IndentedCode) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserIndentedCodeTestcase1 >");
// }

// function parserIndentedCodeTestcase2() {
//   let input = "    code line 1\n    code line 2";
//   let parser = new Parser({});
//   console.info("< ParserIndentedCodeTestcase2 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as IndentedCodeToken).Kind == TokenKind.IndentedCode) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserIndentedCodeTestcase2 >");
// }

// function parserIndentedCodeTestcase3() {
//   let input = "    code line 1\n    code line 2";
//   let parser = new Parser({});
//   console.info("< ParserIndentedCodeTestcase3 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if ((tokens[0] as IndentedCodeToken).Kind == TokenKind.IndentedCode &&
//       (tokens[0] as IndentedCodeToken).Code == "code line 1\ncode line 2") {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserIndentedCodeTestcase3 >");
// }

// // Hr
// function ParserHrTestcase1() {
//   let input = "-- -- --";
//   let parser = new Parser({});
//   console.info("< ParserHrTestcase1 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.Hr) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserHrTestcase1 >");
// }

// // Fenced Code
// function parserFencedCodeTestcase1() {
//   let input = "\`\`\`\nprintf(\"Hello World!\");\n\`\`\`";
//   let parser = new Parser({});
//   console.info("< ParserFencedCodeTestcase1 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.FencedCode &&
//       (tokens[0] as FencedCodeToen).Code == "printf(\"Hello World!\");\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserFencedCodeTestcase1 >");
// }

// function parserFencedCodeTestcase2() {
//   let input = "~~~\nprintf(\"Hello World!\");\n~~~~~";
//   let parser = new Parser({});
//   console.info("< ParserFencedCodeTestcase2 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.FencedCode &&
//       (tokens[0] as FencedCodeToen).Code == "printf(\"Hello World!\");\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserFencedCodeTestcase2 >");
// }

// function parserFencedCodeTestcase3() {
//   let input = "~~~ c\nprintf(\"Hello World!\");\n~~~~~";
//   let parser = new Parser({});
//   console.info("< ParserFencedCodeTestcase3 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.FencedCode &&
//       (tokens[0] as FencedCodeToen).Code == "printf(\"Hello World!\");\n" &&
//       (tokens[0] as FencedCodeToen).Language == "c"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserFencedCodeTestcase3 >");
// }

// // Def
// function parserDefTestcase1() {
//   let input = "[foo]: /url \"title\"";
//   let parser = new Parser({});
//   console.info("< ParserDefTestcase1 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.Reference &&
//       (tokens[0] as ReferenceToken).Label == "foo" &&
//       (tokens[0] as ReferenceToken).Url == "/url" &&
//       (tokens[0] as ReferenceToken).Title == "title"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserDefTestcase1 >");
// }

// function parserDefTestcase2() {
//   let input = "[foo]:\n/url";
//   let parser = new Parser({});
//   console.info("< ParserDefTestcase2 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.Reference &&
//       (tokens[0] as ReferenceToken).Label == "foo" &&
//       (tokens[0] as ReferenceToken).Url == "/url" &&
//       (tokens[0] as ReferenceToken).Title == ""
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserDefTestcase2 >");
// }

// function parserDefTestcase3() {
//   let input = "[foo]: /url \'\ntitle\nline1\nline2\n\'";
//   let parser = new Parser({});
//   console.info("< ParserDefTestcase3 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.Reference &&
//       (tokens[0] as ReferenceToken).Label == "foo" &&
//       (tokens[0] as ReferenceToken).Url == "/url" &&
//       (tokens[0] as ReferenceToken).Title == "\ntitle\nline1\nline2\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< ParserDefTestcase3 >");
// }

// function ParserParagrahTestcase1() {
//   let input = "Heading1\n=====";
//   let parser = new Parser({});
//   console.info("< scannerParagrahTestcase1 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.Heading &&
//       (tokens[0] as HeadingToken).Level == 1 &&
//       (tokens[0] as HeadingToken).Text == "Heading1\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< scannerParagrahTestcase1 >");
// }


// function ParserParagrahTestcase2() {
//   let input = "Heading2\n-------";
//   let parser = new Parser({});
//   console.info("< scannerParagrahTestcase2 >");
//   let tokens = parser.Parse(input);
//   if (tokens.length == 0) {
//     console.error("### TEST FAILED! ###");
//     console.dir(tokens, { depth: Infinity });
//   } else {
//     if (tokens[0].Kind == TokenKind.Heading &&
//       (tokens[0] as HeadingToken).Level == 2 &&
//       (tokens[0] as HeadingToken).Text == "Heading2\n"
//     ) {
//       console.log("### TEST PASSED! ###");
//     } else {
//       console.error("### TEST FAILED! ###");
//       console.dir(tokens, { depth: Infinity });
//     }
//   }
//   console.info("< scannerParagrahTestcase2 >");
// }

// function ParserCommonTestcase1() {
//   let input =
//     `# Intro

// Hi everyone, Today I'm excited to announce a great progress of my first static site generator (SSG) project. That is the markdown parser is completed.

// Markdown is a esay, simple markup languange which is suitable for writing some articles. And it can be esay to transform to html. So a markodnw parser is a basic component of a SSG.

// The markdown parser of *wisp*.


// > here is a simple test.
// >>> here is an another test.
// asdasdasd
// >>> # Heading
// >> # Heading1
// asdasdasd
// `;

//   let parser = new Parser({});
//   let tokens = parser.Parse(input);

//   console.dir(tokens, { depth: Infinity });
// }

// export function ParserTestcases() {
//   // Heading
//   parserHeadingTestcase1();
//   parserHeadingTestcase2();
//   parserHeadingTestcase3();
//   parserHeadingTestcase4();
//   parserHeadingTestcase5();
//   parserHeadingTestcase6();

//   // Block Quote
//   parserBlockQuoteTestcase1();
//   parserBlockQuoteTestcase2();
//   parserBlockQuoteTestcase3();

//   // Blank Line
//   parserBlankLineTestcase1();

//   // Indented Code
//   parserIndentedCodeTestcase1();
//   parserIndentedCodeTestcase2();
//   parserIndentedCodeTestcase3();

//   // Hr
//   ParserHrTestcase1();

//   // Fenced Code
//   parserFencedCodeTestcase1();
//   parserFencedCodeTestcase2();
//   parserFencedCodeTestcase3();

//   // Def
//   parserDefTestcase1();
//   parserDefTestcase2();
//   parserDefTestcase3();

//   // Paragraph
//   ParserParagrahTestcase1();
//   ParserParagrahTestcase2();

//   // Common test
//   ParserCommonTestcase1();
// }
