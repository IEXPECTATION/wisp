import { Markdown } from "../src/markdown/markdown";

let debug = true;

testcase_1();

function testcase_1() {
  let md = new Markdown();
  let input = `
  # Heading



  ** *
  \`\`\` c
  printf("Hello World!");
  \`\`\`

  ~~~ c
  printf("Hello World!");
  ~~~

      printf("Hello World!");
      return 0;

        printf("Hello World");
  ***

  > > # Heading1
  ***

  >> ***
  ***

  >> ***
      printf("Hello World!");

  >> ***
  >> ***

  > ***
  >> ***

  > ***
  >> ***
  > ***

  > ***
  >> ***
  > ***
  >>> ---

  > # Heading1
  >
  abc

  > abc
  def

  > abc
  ===

  > abc
  > ===

  > def
  > ---

  > abc
  >> ===

  edf
  ===

  def

  ===

  paragraph
  # Heading

  >     asdasd
  >     asdasd
  >     asdasd

  >     asdasd
        asdasd
        asdasd

  > ~~~ c
  > printf("Hello World!");
  > ~~~

  > ~~~ c
  > printf("Hello World!");
  ~~~

  > ~~~ c
  printf("Hello World!");
  ~~~

  > ~~~ c

  >     printf("Hello World!");
  >     return;

  >     print("Hello World!");
        return;

  >    return;
  `;

  // input = "# Heading1\n ## Heading2 {Title}\n ### Heading3\n #### Heading4\n ##### Heading5\n ###### Heading6";

  md.parse(input);
  let nodes = md.GetNodes();
  console.dir(nodes, { depth: Infinity });
  console.log(md.render());

  if (debug && nodes.length != 63) {
    console.error(`Length of nodes is not correct! [ Expection: 69 | Real: ${nodes.length} ]`);
    return;
  }
}
