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
  >     return
  
  >     print("Hello World!");
        return
  `

  md.Parse(input);
  let nodes = md.GetNodes();
  console.dir(nodes, { depth: Infinity });
}
