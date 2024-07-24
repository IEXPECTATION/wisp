const TabSize = 4;

type node = blank | heading | hr | code | blockQuote | list | listItem | paragraph;

type blank = {
  Name: "Blank",
  Raw: string,
};

type heading = {
  Name: "Heading",
  Raw: string,
  Text: string,
  Level: number,
  Children: node[],
};

type hr = {
  Name: "Hr",
  Raw: string,
};

type code = {
  Name: "IndentedCode" | "FencedCode",
  Raw: string;
  Text: string;
  Language: string, // TODO: It should use a map to list all supports languages, Or not a string.
};

type blockQuote = {
  Name: "BlockQuote",
  Children: node[];
};

type paragraph = {
  Name: "Paragraph",
  Raw: string,
  Children: node[];
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

    input = `
>> a
>> ---
c
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
        this.lastParagraph = undefined;
        continue;
      }

      if ((prefix = this.isHeading(input)) != undefined) {
        prefix = this.heading(input, prefix.Skip, prefix.Level);
        input = input.substring(prefix);
        this.lastParagraph = undefined;
        continue;
      }

      if ((prefix = this.isHr(input)) != undefined) {
        this.hr(input, prefix);
        input = input.substring(prefix);
        this.lastParagraph = undefined;
        continue;
      }

      if ((prefix = this.isCode(input)) != undefined) {
        prefix = this.code(input, prefix.Skip, prefix.Fenced);
        input = input.substring(prefix);
        this.lastParagraph = undefined;
        continue;
      }

      if ((prefix = this.isBlockQuote(input)) != undefined) {
        prefix = this.blockQuote(input, prefix)
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.paragraph(input)) != undefined) {
        input = input.substring(prefix);
        continue;
      }
    }
  }

  private getNode(tokens: node[], index: number = -1): node | undefined {
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
      if (indent != 0) {
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
      Raw: input.substring(0, skip),
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
    let start = 0;

    if (fenced == undefined) {
      skip = 0;
      start = skip;
      while (true) {
        while (start < input.length) {
          if (input[start++] == '\n') {
            break;
          }
        }

        raw += input.substring(0, start);
        text += input.substring(TabSize, start);

        skip += start;
        if (start == input.length) {
          break;
        }

        input = input.substring(start);
        prefix = this.isCode(input);
        if (prefix == undefined || prefix.Fenced != undefined) {
          break;
        }
        start = prefix.Skip;
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
        start = skip;
        while (skip < input.length && input[skip++] != '\n')
          ;
        let end = skip;
        while (end > start) {
          let c = input[end - 1];
          if (c != ' ' && c != '\t' && c != '\n') {
            break;
          }
          end--;
        }
        language = input.substring(start, end);
      }

      raw += input.substring(0, skip);
      input = input.substring(skip);

      while (true) {
        start = 0;
        while (start < input.length) {
          if (input[start++] == '\n') {
            break;
          }
        }

        raw += input.substring(0, start);
        text += input.substring(0, start);

        skip += start;
        if (start == input.length) {
          break;
        }

        input = input.substring(start);

        prefix = this.isCode(input);
        if (prefix?.Fenced?.Bullet == fenced.Bullet && prefix.Fenced.Length >= fenced.Length) {
          prefix.Skip++;
          raw += input.substring(0, prefix.Skip);
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

  private ensureBlockQuoteRange(input: string, skip: number): { Lines: string[], Skip: number } {
    let lines = []
    let end = 0;
    let blank = false;
    let conitnuation = true;

    while (true) {
      while (skip < input.length) {
        if (input[skip++] == '\n') {
          break;
        }
      }
      end += skip;
      lines.push(input.substring(0, skip));
      input = input.substring(skip);
      if (input.length == 0 ||
        this.isBlank(input) ||
        !conitnuation) {
        break;
      }

      skip = 0;

      let prefix = this.isBlockQuote(input);
      if (prefix == undefined) {
        break;
      }
      skip = prefix;
      // } else {
      //   if (blank) {
      //     break;
      //   }
      //   skip = 0;
      // }

      // let succossor = input.substring(skip);
      // blank = false;
      // if (this.isBlank(succossor) != undefined) {
      //   blank = true;
      // } else {
      //   conitnuation = true;
      //   // Check that there is a continuation of text following.
      //   if (this.isHeading(succossor) != undefined ||
      //     this.isHr(succossor) != undefined ||
      //     this.isCode(succossor) != undefined ||
      //     this.isList(succossor) != undefined) {
      //     if (prefix == undefined) {
      //       break;
      //     } else {
      //       conitnuation = false;
      //     }
      //   }
    }

    return { Lines: lines, Skip: end };
  }

  private _blockQuote(input: string, skip: number) {
    let lines = [];
    ({ Lines: lines, Skip: skip } = this.ensureBlockQuoteRange(input, skip));

    // TODO: Myabe throw an error when `lines` is empty.
    let quote: blockQuote = {
      Name: "BlockQuote",
      Children: [],
    }
    let oldNodes = this.nodes;
    this.nodes = quote.Children;

    let prefix = undefined;
    let i = 0;
    let line = "";
    while (i < lines.length) {
      prefix = this.isBlockQuote(lines[i]);
      if (prefix == undefined) {
        line += lines[i];
      } else {
        line += lines[i].substring(prefix);
      }
      i++;
    }

    this.Parse(line);

    this.nodes = oldNodes;
    this.nodes.push(quote);

    return skip;
  }

  private blockQuote(input: string, skip: number): number {
    return this._blockQuote(input, skip);

    // // Remove the block quote markers.
    // let lines = "";
    // let line = 0;
    // let raw = input.substring(0, skip);
    // input = input.substring(skip);

    // let end = 0;
    // let blankLine = false;
    // while (true) {
    //   while (end < input.length) {
    //     if (input[end++] == '\n') {
    //       break;
    //     }
    //   }

    //   skip += end;
    //   lines += input.substring(0, end);
    //   raw += input.substring(0, end);
    //   input = input.substring(end);
    //   if (input.length == 0) {
    //     break;
    //   }

    //   // Find the end of blockquote.
    //   /*
    //     1. A blank line follows to blockquote.
    //       > any
    //       (blank line)
    //     2. The last line of blockquote is blank line.
    //       > (blank line)
    //       any
    //     3. Any other element.
    //       > any
    //       any (except contination text)
    //   */

    //   let prefix = this.isBlockQuote(input);
    //   if (prefix != undefined) {
    //     raw += input.substring(0, prefix);
    //     input = input.substring(prefix);
    //     if (this.isBlank(input) != undefined) {
    //       blankLine = true;
    //     } else {
    //       blankLine = false;
    //     }
    //     skip += prefix;
    //   } else if (!blankLine && this.isContinuationText(input)) {
    //     this.continuationLines.push(line);
    //   } else {
    //     break;
    //   }
    //   line += 1;
    //   end = 0;
    // }

    // if (lines == "") {
    //   return 0;
    // }

    // let qb: blockQuote = {
    //   Name: "BlockQuote",
    //   Children: []
    // }
    // this.nodes.push(qb);
    // let oldNodes = this.nodes;
    // this.nodes = qb.Children;

    // this.Parse(lines);

    // // let node = this.getNode(this.nodes);
    // // while (node?.Name == "BlockQuote") {
    // //   node = this.getNode(node.Children);
    // // }
    // // if (node?.Name == "Paragraph") {  // If the last node is paragraph, we check the next lines are a continuation text.
    // //   let end = 0;
    // //   while (input.length > 0) {
    // //     if (!this.isContinuationText(input)) {
    // //       break;
    // //     }

    // //     end = 0;
    // //     while (end < input.length) {
    // //       if (input[end++] == '\n') {
    // //         break;
    // //       }
    // //     }
    // //     node.Raw += input.substring(0, end);
    // //     input = input.substring(end);
    // //     skip += end;
    // //   }
    // // }
    // this.continuationLines = [];
    // this.nodes = oldNodes;
    // return skip;
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
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (numberOfSpaces >= TabSize || skip == input.length) {
      return 0;
    }

    let raw = "";
    let end = skip;
    let line = 0;
    while (input.length > 0) {
      while (end < input.length) {
        if (input[end++] == '\n') {
          break;
        }
      }

      raw += input.substring(0, end);
      input = input.substring(end);
      skip += end;

      let prefix = this.isSetextHeading(input);
      if (prefix != undefined) {
        this.nodes.push({
          Name: "Heading",
          Raw: raw,
          Text: raw,
          Level: prefix.Level,
          Children: [],
        });
        this.lastParagraph = undefined;
        return skip + prefix.Skip;
      }

      if (!this.isContinuationText(input)) {
        break;
      }
      end = 0;
      line += 1;
    }

    if (this.lastParagraph == undefined) {
      let p: paragraph = {
        Name: "Paragraph",
        Raw: raw,
        Children: [],
      };
      this.nodes.push(p);
      this.lastParagraph = p;
    } else {
      this.lastParagraph.Raw += raw;
    }
    return skip;
  }

  private root: node[] = [];
  private nodes: node[] = this.root;
  private lastParagraph: paragraph | undefined;
};

let p = new Markdown();
p.Main();