const TabSize = 4;

type token = blank | heading | hr | fencedCode | indentedCode | blockQuote | list | listItem | paragraph;

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
};

type fencedCode = {
  Name: "FencedCode",
  Raw: string,
  Text: string,
  Bullet: string,
  Length: number,
  Language: string, // TODO: It should use a map to list all supports languages, Or not a string.
}

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
        preifx = this.blockQuote(input, prefix)
      }
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

    if (this.isFencedCode(input) != undefined) {
      return false;
    }

    if (this.isIndentedCode(input) != undefined) {
      return false;
    }

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
    this.tokens.push({
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

    this.tokens.push(({
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

    // let token = this.getToken(this.tokens);
    // if (bullet == '-' && token?.Name == "Paragraph" && !token.Completed) {
    //   return undefined;
    // }
    return skip;
  }

  private hr(input: string, skip: number) {
    this.tokens.push({ Name: "Hr", Raw: input.substring(0, skip) });
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
    if (fenced == undefined) {
      // 
    } else {

    }

    return 0;
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
    // let prefix = this.isBlockQuote(input);
    // if (prefix == undefined) {
    //   return 0;
    // }

    // let end = prefix;
    // let bp = this.blocks.length;

    // // Skip the exited block quote markers.
    // while (true) {
    //   if (bp == 0 || this.blocks[--bp].Name != 'BlockQuote') {
    //     break;
    //   }
    //   input = input.substring(prefix);
    //   prefix = this.isBlockQuote(input);
    //   if (prefix == undefined) {
    //     break;
    //   }
    //   end += prefix
    // }

    // // Add the remaining block quote markers.
    // if (prefix != undefined) {
    //   if (bp == 0) {
    //     // Close the previous token before adding new block quote token.
    //     let token = this.getToken(this.tokens);
    //     if (token?.Name == "Paragraph") {
    //       token.Completed = true;
    //     }
    //     this.insideFenced = false;
    //     this.insideIndented = false;
    //   }

    //   while (true) {
    //     let qb: blockQuote = {
    //       Name: "BlockQuote",
    //       Children: []
    //     };

    //     this.tokens.push(qb);
    //     this.blocks.push(qb);
    //     this.tokens = qb.Children;

    //     input = input.substring(prefix);
    //     prefix = this.isBlockQuote(input);
    //     if (prefix == undefined) {
    //       break;
    //     }
    //     end += prefix;
    //   }
    // }

    // return end;
    return 0;
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
    let prefix = this.isSetextHeading(input);
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
  private insideIndented: boolean = false;
  private insideQuote: boolean = false;
  private insideList: boolean = false;
  private blocks: token[] = [];
  private root: token[] = [];
  private tokens: token[] = this.root;
};

let p = new Markdown();
p.Main();