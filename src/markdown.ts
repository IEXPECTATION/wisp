const TabSize = 4;

type token = blank | heading | hr | code | blockQuote | list | listItem | paragraph;

type blank = {
  Name: "Blank",
  Raw: string,
};

type heading = {
  Name: "Heading",
  Raw: string,
  Text: string,
  Level: number,
  Children: token[],
};

type hr = {
  Name: "Hr",
  Raw: string,
};

type indentedCode = {
  Name: "IndentedCode",
  Raw: string,
  Text: string,
  Completed: boolean,
};

type fencedCode = {
  Name: "FencedCode",
  Raw: string,
  Text: string,
  Bullet: string,
  Length: number,
  Language: string, // TODO: It should use a map to list all supports languages, Or not a string.
  Completed: boolean,
}

type code = {
  Name: "FencedCode" | "IndentedCode",
  Raw: string,
  Text: string,
  Language: string,
  Completed: boolean,
};

type blockQuote = {
  Name: "BlockQuote",
  Children: token[];
};

type paragraph = {
  Name: "Paragraph",
  Raw: string,
  Completed: boolean,
  Children: token[];
};

type list = {
  Name: "List",
  Children: listItem[];
};

type listItem = {
  Name: "ListItem",
  Raw: string,
};

class Parser {
  Main() {
    /*     let input = `
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
    `;
     */
    let input = `
> # Heading1
>
aaa

> bbb
ccc

> ddd
===

> eee
> ===

> fff
> ---

> ggg
>> ===

hhh
===

iii

===

paragraph
# Heading

> ~~~ c
> printf("Hello World!");
> ~~~

> ~~~ c
> printf("Hello World!");
~~~

> ~~~ c
printf("Hello World!");
~~~
`
    this.Parse(input);
    console.dir(this.root, { depth: Infinity });
  }

  Parse(input: string) {
    let skip = 0;
    while (input.length > 0) {
      this.postAction(input);

      if (!this.insideFenced && (skip = this.blank(input)) > 0) {
        input = input.substring(skip);
        this.insideQuote = false;
        continue;
      }

      if (!this.insideFenced && (skip = this.hr(input)) > 0) {
        input = input.substring(skip);
        this.insideQuote = false;
        continue;
      }

      if (!this.insideFenced && (skip = this.heading(input)) > 0) {
        input = input.substring(skip);
        this.insideQuote = false;
        continue;
      }

      if ((skip = this.fencedCode(input)) > 0) {
        input = input.substring(skip);
        this.insideQuote = false;
        continue;
      }

      if (!this.insideFenced && (skip = this.indentedCode(input)) > 0) {
        input = input.substring(skip);
        this.insideQuote = false;
        continue;
      }

      if (!this.insideFenced && (skip = this.blockQuote(input)) > 0) {
        input = input.substring(skip);
        this.insideQuote = true;
        continue;
      }

      if (!this.insideFenced && (skip = this.paragraph(input)) > 0) {
        input = input.substring(skip);
        this.insideQuote = false;
        continue;
      }
    }

    this.finalize(input);
  }

  private finalize(input: string) {
    this.postAction(input);
    let token = this.getToken(this.tokens);
    if (token == undefined) {
      return;
    }

    if (token.Name == "Paragraph" || token.Name == "FencedCode" || token.Name == "IndentedCode") {
      token.Completed = true;
    }
  }

  private postAction(input: string) {
    if (this.insideQuote) {
      return;
    }

    let token = this.getToken(this.tokens);
    if (token == undefined) {
      return;
    }

    if (token.Name != "Paragraph") {
      let previousToken = this.getToken(this.tokens, -2);
      if (previousToken?.Name == "Paragraph") {
        previousToken.Completed = true;
      }
    }

    // TODO: Test required.
    if (token.Name == "IndentedCode" && this.indentedCodePrefix(input) == undefined) {
      token.Completed = true;
    }

    if (this.getToken(this.blocks)?.Name == "BlockQuote" &&
      (token.Name == "Paragraph" && token.Completed) ||
      (token.Name != "Paragraph" && this.blockQuotePrefix(input) == undefined)) {
      while (this.blocks.length > 0) {
        if (this.getToken(this.blocks)?.Name != "BlockQuote") {
          break;
        }
        this.blocks.pop();
      }
      if (token.Name == "Paragraph" || token.Name == "IndentedCode") {
        token.Completed = true;
      } else if (token.Name == "FencedCode") {
        token.Completed = true;
        this.insideFenced = false;
      }
      this.tokens = this.root;
      this.insideQuote = false;
    }
  }

  private getToken(tokens: token[], index: number = -1): token | undefined {
    let length = tokens.length;
    if (length == 0) {
      return undefined;
    }
    if (index < 0) {
      return tokens[length + index];
    }
    return tokens[index];
  }

  private skipLeaddingWhiteSpace(input: string, offset: number = 0): { Skip: number, NumberOfSpaces: number } {
    let count = 0;
    while (true) {
      if (input[offset] == ' ') {
        count++;
      } else if (input[offset] == '\t') {
        count += 4;
      } else {
        break;
      }
      offset++;
    }
    return { Skip: offset, NumberOfSpaces: count };
  }

  private blank(input: string): number {
    let skip = 0;
    let raw = "";

    while (input.length > 0) {
      let { Skip: offset, NumberOfSpaces: count } = this.skipLeaddingWhiteSpace(input);
      if (count < input.length && input[offset] != '\n') {
        break;
      }
      if (offset < input.length) {
        offset++;
      }
      skip += offset;
      raw += input.substring(0, offset);
      input = input.substring(offset);
    }

    if (skip != 0) {
      this.tokens.push({
        Name: "Blank",
        Raw: raw,
      })

    }
    return skip;
  }

  private headingPrefix(input: string): { Skip: number, Level: number } | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (skip == input.length || numberOfSpaces >= TabSize || input[skip] != '#') {
      return undefined;
    }

    let level = 1;
    while (true) {
      if (level > 6 || skip == input.length || input[++skip] != '#') {
        break;
      }
      level++;
    }

    if (skip == input.length || (input[skip++] != ' ' && skip == input.length)) {
      return undefined;
    }

    return { Skip: skip, Level: level };
  }

  private heading(input: string): number {
    let prefix = this.headingPrefix(input);
    if (prefix == undefined) {
      return 0;
    }

    let skip = prefix.Skip;
    while (true) {
      if (skip == input.length || input[skip++] == '\n') {
        break;
      }
    }

    let end = skip - 1;
    while (input[end - 1] == ' ') {
      end--;
    }

    this.tokens.push(({
      Name: "Heading",
      Raw: input.substring(0, skip),
      Text: input.substring(prefix.Skip, end),
      Level: prefix.Level,
      Children: []
    }));

    return skip;
  }

  private hr(input: string): number {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (skip == input.length || numberOfSpaces >= TabSize) {
      return 0;
    }

    let bullet = input[skip];
    if (bullet != '_' && bullet != '*' && bullet != '-') {
      return 0;
    }

    let token = this.getToken(this.tokens);
    if (bullet == '-' && token?.Name == "Paragraph" && !token.Completed) {
      return 0;
    }

    let count = 1;
    while (true) {
      if (skip == input.length) {
        break;
      }

      let c = input[++skip];
      if (c == bullet) {
        count++;
        continue;
      }

      if (c != ' ' && c == '\n') {
        break;
      }
    }

    if (count < 3)
      return 0;

    if (skip < input.length) {
      skip++;
    }

    this.tokens.push({ Name: "Hr", Raw: input.substring(0, skip) });

    return skip;
  }

  private fencedCodePrefix(input: string): { Skip: number, Bullet: string, Length: number } | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (numberOfSpaces >= TabSize || skip == input.length) {
      return undefined;
    }
    let bullet = input[skip];
    if (bullet != '`' && bullet != '~') {
      return undefined;
    }
    numberOfSpaces = 1;
    while (++skip < input.length && input[skip] == bullet) {
      numberOfSpaces++;
    }
    if (numberOfSpaces < 3) {
      return undefined;
    }
    return { Skip: skip, Bullet: bullet, Length: numberOfSpaces };
  }

  private fencedCode(input: string): number {
    // TODO: Need to refactor the code.
    let skip = 0;
    if (this.insideFenced) {
      let token = this.getToken(this.tokens) as fencedCode;

      // If we are already processing a fenced code, find the ending characters.
      let prefix = this.fencedCodePrefix(input);
      if (prefix != undefined) {
        if (prefix.Bullet == token.Bullet && prefix.Bullet >= token.Bullet) {
          token.Raw += input.substring(0, prefix.Skip);
          token.Completed = true;
          return prefix.Skip;
        }
      }

      // add this line to the token;
      while (skip < input.length && input[skip++] != '\n')
        ;

      let line = input.substring(0, skip);
      token.Raw += line;
      token.Text += line;
    } else {
      let prefix = this.fencedCodePrefix(input);
      if (prefix == undefined) {
        return 0;
      }

      skip = prefix.Skip;
      // Add the language to token if there is a language specified.
      // Remove the white space following open tag.
      while (input[skip] == ' ' || input[skip] == '\t') {
        skip++;
      }

      let language = "";
      if (input[skip] != '\n') {
        let start = skip;
        while (skip < input.length && input[skip] != '\n') {
          skip++;
        }
        let trim = skip;
        while (trim > start) {
          let c = input[trim - 1];
          if (c != ' ' && c != '\t') {
            break;
          }
          trim--;
        }
        language = input.substring(start, trim);
      }

      let fencedCode: fencedCode = {
        Name: "FencedCode",
        Raw: input.substring(0, skip),
        Text: "",
        Bullet: prefix.Bullet,
        Length: prefix.Length,
        Language: language,
        Completed: false,
      }

      this.tokens.push(fencedCode);
      this.insideFenced = true;
    }
    return skip;
  }

  private indentedCodePrefix(input: string): { Skip: number, NumbserOfSpace: number } | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (skip < input.length && numberOfSpaces >= TabSize) {
      return { Skip: skip, NumbserOfSpace: numberOfSpaces };
    }

    return undefined;
  }

  private indentedCode(input: string): number {
    // TODO: Need to refactor the code.
    return 0;
    // let prefix = this.indentedCodePrefix(input);
    // if (prefix == undefined) {
    //   return 0;
    // }

    // let text = "";
    // let raw = "";
    // let start = TabSize, end = prefix.Skip;

    // while (true) {
    //   // find the end of current line.
    //   while (end < input.length && input[end] != '\n') {
    //     end++;
    //   }
    //   if (end < input.length) {
    //     end++;
    //   }
    //   text += input.substring(start, end);
    //   raw += input.substring(0, end);
    //   if (end == input.length) {
    //     break;
    //   }

    //   input = input.substring(end);
    //   end = this.blank(input);
    //   if (end > 0) {
    //     text += input.substring(0, end);
    //     raw += input.substring(0, end);
    //     input = input.substring(end);
    //   }

    //   prefix = this.indentedCodePrefix(input);
    //   if (prefix == undefined) {
    //     break;
    //   }
    //   end = prefix.Skip;
    // }

    // this.tokens.push({
    //   Name: "IndentedCode",
    //   Raw: raw,
    //   Text: text,
    //   Language: "",
    // });
    // return raw.length;
  }

  private def(input: string): number {
    // TODO: TBD
    return 0;
  }

  private html(input: string): number {
    // TODO: TBD
    return 0;
  }

  private blockQuotePrefix(input: string): number | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (numberOfSpaces >= TabSize || skip == input.length) {
      return undefined;
    }

    if (input[skip] != '>') {
      return undefined;
    }

    if (input[++skip] == ' ') {
      skip++;
    }

    return skip;
  }

  private blockQuote(input: string): number {
    let prefix = this.blockQuotePrefix(input);
    if (prefix == undefined) {
      return 0;
    }

    let end = prefix;
    let bp = this.blocks.length;

    // Skip the exited block quote markers.
    while (true) {
      if (bp == 0 || this.blocks[--bp].Name != 'BlockQuote') {
        break;
      }
      input = input.substring(prefix);
      prefix = this.blockQuotePrefix(input);
      if (prefix == undefined) {
        break;
      }
      end += prefix
    }

    // Add the remaining block quote markers.
    if (prefix != undefined) {
      while (true) {
        let qb: blockQuote = {
          Name: "BlockQuote",
          Children: []
        };

        this.tokens.push(qb);
        this.blocks.push(qb);
        this.tokens = qb.Children;

        input = input.substring(prefix);
        prefix = this.blockQuotePrefix(input);
        if (prefix == undefined) {
          break;
        }
        end += prefix;
      }
    }

    return end;
  }

  private list(input: string): number {
    // TODO: TBD
    return 0;
  }

  private lheading(input: string): { Skip: number, Level: number } | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (numberOfSpaces >= TabSize || skip == input.length) {
      return undefined;
    }

    let bullet = input[skip];
    if (bullet != '=' && bullet != '-') {
      return undefined;
    }

    let count = 1;
    while (skip++ < input.length) {
      if (input[skip] == '\n') {
        break;
      } else if (input[skip] != bullet) {
        return undefined;
      }
      count++;
    }

    if (skip < input.length) {
      skip++;
    }

    if (count < 3) {
      return undefined;
    }

    return { Skip: skip, Level: bullet == '=' ? 1 : 2 };
  }

  private paragraph(input: string): number {
    let token = this.getToken(this.tokens);
    if (token?.Name != "Paragraph" || token.Completed) {
      let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
      if (numberOfSpaces >= TabSize || skip == input.length) {
        return 0;
      }

      while (true) {
        if (skip < input.length && input[skip++] == '\n') {
          break;
        }
      }

      this.tokens.push({
        Name: "Paragraph",
        Raw: input.substring(0, skip),
        Completed: false,
        Children: []
      });

      return skip;
    }

    // Check if this line should be combined with the previous line to form a Setext-style heading.
    let prefix = this.lheading(input);
    if (prefix == undefined) {
      // Not a setext-style heading.
      // Accept the current line.
      let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
      if (numberOfSpaces >= TabSize || skip == input.length) {
        return 0;
      }

      while (true) {
        if (skip < input.length && input[skip++] == '\n') {
          break;
        }
      }

      token.Raw += input.substring(0, skip);
      return skip;
    } else {
      // It is a setext-style heading.
      // If we are inside a block quote, we need to check whether the previous token is the block quote marker or not.
      // token = this.getLastToken(this.stack);
      if ((this.getToken(this.blocks))?.Name == "BlockQuote" && !this.insideQuote) {
        token.Raw += input.substring(0, prefix.Skip);
      } else {
        token = this.tokens.pop() as paragraph;
        this.tokens.push({
          Name: "Heading",
          Raw: token.Raw,
          Text: token.Raw,
          Level: prefix.Level,
          Children: [],
        });
      }
      return prefix.Skip;
    }
  }

  private insideFenced: boolean = false;
  private insideQuote: boolean = false;
  private insideList: boolean = false;
  private blocks: token[] = [];
  private root: token[] = [];
  private tokens: token[] = this.root;
};

let p = new Parser();
p.Main();