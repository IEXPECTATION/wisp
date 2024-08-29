import { ParserTestcases } from "../src/markdown/parser";
import { ScannerTestcases } from "../src/markdown/scanner";

(function main() {
  ScannerTestcases();
  ParserTestcases();
})();



// import { Markdown } from "../src/markdown/markdown";

// let debug = false;

// testcase_1();

// function testcase_1() {
//   let md = new Markdown();
//   let input = `
//   # Heading



//   ** *
//   \`\`\` c
//   printf("Hello World!");
//   \`\`\`

//   ~~~ c
//   printf("Hello World!");
//   ~~~

//       printf("Hello World!");
//       return 0;

//         printf("Hello World");
//   ***

//   > > # Heading1
//   ***

//   >> ***
//   ***

//   >> ***
//       printf("Hello World!");

//   >> ***
//   >> ***

//   > ***
//   >> ***

//   > ***
//   >> ***
//   > ***

//   > ***
//   >> ***
//   > ***
//   >>> ---

//   > # Heading1
//   >
//   abc

//   > abc
//   def

//   > abc
//   ===

//   > abc
//   > ===

//   > def
//   > ---

//   > abc
//   >> ===

//   edf
//   ===

//   def

//   ===

//   paragraph
//   # Heading

//   >     asdasd
//   >     asdasd
//   >     asdasd

//   >     asdasd
//         asdasd
//         asdasd

//   > ~~~ c
//   > printf("Hello World!");
//   > ~~~

//   > ~~~ c
//   > printf("Hello World!");
//   ~~~

//   > ~~~ c
//   printf("Hello World!");
//   ~~~

//   > ~~~ c

//   >     printf("Hello World!");
//   >     return;

//   >     print("Hello World!");
//         return;

//   >    return;
//   `;

//   input = "# Heading1\n ## Heading2 {Title}\n ### Heading3\n #### Heading4\n ##### Heading5\n ###### Heading6";

//   md.Parse(input);
//   let nodes = md.getNodes();
//   console.dir(nodes, { depth: Infinity });

//   if (debug && nodes.length != 71) {
//     console.error(`Length of nodes is not correct! [ Expection: 71 | Real: ${nodes.length} ]`);
//     return;
//   }

//   console.log(md.Render());
// }

// function ParsingHeading_test() {
//   let md = new Markdown("");
//   let h1 = "# H1";
//   let h2 = "## H2";
//   let h3 = "### H3";
//   let h4 = "#### H4";
//   let h5 = "##### H5";
//   let h6 = "###### H6";


// }