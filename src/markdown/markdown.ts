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

// type indentedCode = {
//   Name: "IndentedCode",
//   Raw: string,
//   Text: string,
// };

// type fencedCode = {
//   Name: "FencedCode",
//   Raw: string,
//   Text: string,
//   Language: string, // TODO: It should use a map to list all supports languages, Or not a string.
// }

type code = {
  Name: "IndentedCode" | "FencedCode",
  Raw: string;
  Text: string;
  Language: string, // TODO: It should use a map to list all supports languages, Or not a string.
};

type blockQuote = {
  Name: "BlockQuote",
  Children: token[];
};

type paragraph = {
  Name: "Paragraph",
  Raw: string,
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

class Markdown {
  Main() {
    /*
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
    */

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

>     printf("Hello World!");
>     return

>     print("Hello World!");
      return
    `

    this.Parse(input);
    console.dir(this.root, { depth: Infinity });
  }

  Parse(input: string) {
    let prefix = undefined;
    while (input.length > 0) {
      if ((prefix = this.isBlank(input)) != undefined) {
        this.blank(input, prefix);
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.isHeading(input)) != undefined) {
        prefix = this.heading(input, prefix.Skip, prefix.Level);
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.isHr(input)) != undefined) {
        this.hr(input, prefix);
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.isCode(input)) != undefined) {
        prefix = this.code(input, prefix.Skip, prefix.Fenced);
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.isBlockQuote(input)) != undefined) {
        prefix = this.blockQuote(input, prefix)
        continue;
      }
    }
  }

  private getNode(tokens: token[], index: number = -1): token | undefined {
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

  private isContinuationText(input: string, indent: number = 0): boolean {
    if (this.isBlank(input) != undefined) {
      if (indent == 0) {
        return true;
      }
      return false;
    }

    if (this.isHeading(input) != undefined) {
      return false;
    }

    if (this.isHr(input) != undefined) {
      return false;
    }

    if (this.isCode(input) != undefined) {
      return false;
    }

    // if (this.isFencedCode(input) != undefined) {
    //   return false;
    // }

    // if (this.isIndentedCode(input) != undefined) {
    //   return false;
    // }

    if (this.isBlockQuote(input) != undefined) {
      return false;
    }

    if (this.isList(input) != undefined) {
      return false;
    }

    return true;
  }

  private isBlank(input: string): number | undefined {
    let skip = 0;

    while (input.length > 0) {
      let { Skip: offset, NumberOfSpaces: count } = this.skipLeaddingWhiteSpace(input);
      if (count < input.length && input[offset] != '\n') {
        break;
      }
      if (offset < input.length) {
        offset++;
      }
      skip += offset;
      input = input.substring(offset);
    }

    if (skip > 0) {
      return skip;
    }
    return undefined;
  }

  private blank(input: string, skip: number) {
    this.nodes.push({
      Name: "Blank",
      Raw: input.substring(skip),
    });
  }

  private isHeading(input: string): { Skip: number, Level: number } | undefined {
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

  private heading(input: string, skip: number, level: number): number {
    let origin = skip;
    while (true) {
      if (skip == input.length || input[skip++] == '\n') {
        break;
      }
    }

    let end = skip - 1;
    while (input[end - 1] == ' ') {
      end--;
    }

    this.nodes.push(({
      Name: "Heading",
      Raw: input.substring(0, skip),
      Text: input.substring(origin, end),
      Level: level,
      Children: []
    }));

    return skip;
  }

  private isHr(input: string): number | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (skip == input.length || numberOfSpaces >= TabSize) {
      return undefined;
    }

    let bullet = input[skip];
    if (bullet != '_' && bullet != '*' && bullet != '-') {
      return undefined;
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
      return undefined;

    if (skip < input.length) {
      skip++;
    }

    return skip;
  }

  private hr(input: string, skip: number) {
    this.nodes.push({ Name: "Hr", Raw: input.substring(0, skip) });
  }

  private isCode(input: string): {
    Skip: number,
    Fenced: {
      Bullet: string,
      Length: number,
    } | undefined
  } | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (skip < input.length && numberOfSpaces >= TabSize) {
      return { Skip: skip > TabSize ? TabSize : skip, Fenced: undefined };
    }

    let bullet = input[skip];
    if (bullet != '`' && bullet != '~') {
      return undefined;
    }
    let length = 1;
    while (++skip < input.length && input[skip] == bullet) {
      length++;
    }
    if (length < 3) {
      return undefined;
    }
    return { Skip: skip, Fenced: { Bullet: bullet, Length: length } };
  }

  private code(input: string, skip: number, fenced: { Bullet: string, Length: number } | undefined): number {
    let text = "";
    let raw = "";
    let prefix = undefined;

    if (fenced == undefined) {
      while (true) {
        while (skip < input.length) {
          if (input[skip++] == '\n') {
            break;
          }
        }

        raw += input.substring(0, skip);
        text += input.substring(TabSize, skip);

        if (skip == input.length) {
          break;
        }

        input = input.substring(skip);
        prefix = this.isCode(input);
        if (prefix == undefined || prefix.Fenced != undefined) {
          break;
        }
        skip = prefix.Skip;
      }
      this.nodes.push({
        Name: "IndentedCode",
        Raw: raw,
        Text: text,
        Language: "",
      });

    } else {
      let language = "";
      if (input[skip] != '\n') {
        let start = skip;
        while (skip < input.length && input[skip++] != '\n')
          ;
        let trim = skip;
        while (trim > start) {
          let c = input[trim - 1];
          if (c != ' ' && c != '\t' && c != '\n') {
            break;
          }
          trim--;
        }
        language = input.substring(start, trim);
      }

      raw += input.substring(0, skip);
      input = input.substring(skip);

      while (true) {
        while (skip < input.length) {
          if (input[skip++] == '\n') {
            break;
          }
        }

        raw += input.substring(0, skip);
        text += input.substring(0, skip);

        if (skip == input.length) {
          break;
        }

        input = input.substring(skip);
        prefix = this.isCode(input);
        if (prefix?.Fenced?.Bullet == fenced.Bullet && prefix.Fenced.Length >= fenced.Length) {
          raw += input.substring(0, skip);
          skip += prefix.Skip;
          break;
        }
      }
      this.nodes.push({
        Name: "FencedCode",
        Raw: raw,
        Text: text,
        Language: language,
      });
    }

    return skip;
  }

  private def(input: string): number {
    // TODO: TBD
    return 0;
  }

  private html(input: string): number {
    // TODO: TBD
    return 0;
  }

  private isBlockQuote(input: string): number | undefined {
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

  private blockQuote(input: string, skip: number): number {
    // Remove the block quote markers.
    let raw = input.substring(0, skip);
    let lines = "";

    while (true) {
      let origin = skip;
      while (skip < input.length) {
        if (input[skip++] == '\n') {
          break;
        }
      }
      lines += input.substring(origin, skip);

      let prefix = this.isBlockQuote(input);
      if (prefix == undefined) {
        break;
      }
      raw += input.substring(0, skip);
      skip = prefix;
    }

    if (lines == "") {
      return 0;
    }

    let qb: blockQuote = {
      Name: "BlockQuote",
      Children: []
    }
    this.nodes.push(qb);
    let oldNodes = this.nodes;
    this.nodes = qb.Children;

    this.Parse(lines);

    let node = this.getNode(this.nodes);
    if (node?.Name == "Paragraph") {  // If the last node is paragraph, we check the next lines are a continuation text.
      while (true) {
        if (!this.isContinuationText(input)) {
          break;
        }

        let origin = skip;
        while (skip < input.length) {
          if (input[skip++] == '\n') {
            break;
          }
        }
        node.Raw += input.substring(origin, skip);
        input = input.substring(skip);
      }
    }

    this.nodes = oldNodes;
    return skip;
  }

  private isList(input: string): { Skip: number, Ordered: boolean, Bullet: string } | undefined {
    // TODO:
    return undefined;
  }

  private list(input: string): number {
    // TODO: TBD
    return 0;
  }

  private isSetextHeading(input: string): { Skip: number, Level: number } | undefined {
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
    // let token = this.getNode(this.nodes);
    // if (token?.Name != "Paragraph" || token.Completed) {
    //   let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    //   if (numberOfSpaces >= TabSize || skip == input.length) {
    //     return 0;
    //   }

    //   while (skip < input.length) {
    //     if (input[skip++] == '\n') {
    //       break;
    //     }
    //   }

    //   this.nodes.push({
    //     Name: "Paragraph",
    //     Raw: input.substring(0, skip),
    //     Completed: false,
    //     Children: []
    //   });

    //   return skip;
    // }

    // // Check if this line should be combined with the previous line to form a Setext-style heading.
    // let prefix = this.isSetextHeading(input);
    // if (prefix == undefined) {
    //   // Not a setext-style heading.
    //   // Accept the current line.
    //   let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    //   if (numberOfSpaces >= TabSize || skip == input.length) {
    //     return 0;
    //   }

    //   while (skip < input.length) {
    //     if (input[skip++] == '\n') {
    //       break;
    //     }
    //   }

    //   token.Raw += input.substring(0, skip);
    //   return skip;
    // } else {
    //   // It is a setext-style heading.
    //   // If we are inside a block quote, we need to check whether the previous token is the block quote marker or not.
    //   // token = this.getLastToken(this.stack);
    //   if ((this.getNode(this.blocks))?.Name == "BlockQuote" && !this.insideQuote) {
    //     token.Raw += input.substring(0, prefix.Skip);
    //   } else {
    //     token = this.nodes.pop() as paragraph;
    //     this.nodes.push({
    //       Name: "Heading",
    //       Raw: token.Raw,
    //       Text: token.Raw,
    //       Level: prefix.Level,
    //       Children: [],
    //     });
    //   }
    //   return prefix.Skip;
    // }
    return 0;
  }

  private insideFenced: boolean = false;
  private insideIndented: boolean = false;
  private insideQuote: boolean = false;
  private insideList: boolean = false;
  private blocks: token[] = [];
  private root: token[] = [];
  private nodes: token[] = this.root;
};

let p = new Markdown();
p.Main();