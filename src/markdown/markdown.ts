const TabSize = 4;

type node = blank | heading | hr | code | blockquote | list | listitem | paragraph | text | em | escape | codespan;

// Block Node
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

type blockquote = {
  Name: "BlockQuote",
  Children: node[];
};

type def = {
  Name: "Definition",
  Label: string,
  Path: string,
  Title: string,
}

type paragraph = {
  Name: "Paragraph",
  Raw: string,
  Children: node[];
};

type list = {
  Name: "List",
  Children: listitem[];
};

type listitem = {
  Name: "ListItem",
  Raw: string,
};

// Inline Node
type text = {
  Name: "Text",
  Text: string,
};

type em = {
  Name: "Emphais",
  Blod: boolean,
  Text: string,
}

type escape = {
  Name: "Escape",
  Text: string,
}

type codespan = {
  Name: "CodeSpan",
  Text: string,
}

export class Markdown {
  Parse(input: string) {
    let prefix = undefined;
    while (input.length > 0) {
      if ((prefix = this.isBlank(input)) != undefined) {
        this.lastParagraph = undefined;
        this.blank(input, prefix);
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.isHeading(input)) != undefined) {
        this.lastParagraph = undefined;
        prefix = this.heading(input, prefix.Skip, prefix.Level);
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.isHr(input)) != undefined) {
        this.lastParagraph = undefined;
        this.hr(input, prefix);
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.isCode(input)) != undefined) {
        this.lastParagraph = undefined;
        prefix = this.code(input, prefix.Skip, prefix.Fenced);
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.isDef(input)) != undefined) {
        this.lastParagraph = undefined;
        prefix = this.def(input, prefix.Skip, prefix.Label);
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.isBlockqute(input)) != undefined) {
        this.lastParagraph = undefined;
        prefix = this.blockquote(input, prefix)
        input = input.substring(prefix);
        continue;
      }

      if ((prefix = this.paragraph(input)) != undefined) {
        input = input.substring(prefix);
        continue;
      }
    }
  }

  Render(): string {
    let visistor = function (output: string, node: node): string {
      switch (node.Name) {
        case "Blank":
          break;
        case "Heading":
          output += node.Text;
          break;
      }
      return output;
    }
    return this.render(this.nodes, "", visistor);
  }

  // Only for test
  getNodes(): node[] {
    return this.nodes;
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

    if (this.isBlockqute(input) != undefined) {
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
      let { Skip: end, NumberOfSpaces: count } = this.skipLeaddingWhiteSpace(input);
      if (count < input.length && input[end] != '\n') {
        break;
      }
      if (end < input.length) {
        end++;
      }
      skip += end;
      input = input.substring(end);
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
    while (input[end] == ' ' || input[end] == '\t') {
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
        // Skip the spaces which follows the fence code remarker.
        while (input[skip] == ' ' || input[skip] == '\t') {
          skip++;
        }
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

  private isDef(input: string): { Skip: number, Label: string } | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (skip < input.length && numberOfSpaces >= TabSize) {
      return undefined;
    }

    if (input[skip] != '[') {
      return undefined;
    }

    let label_start = skip + 1;
    while (skip < input.length) {
      if (input[++skip] == ']') {
        break;
      }
    }

    let label_end = skip;
    if (skip == input.length ||
      input[++skip] != ':'
    ) {
      return undefined;
    }

    while (++skip < input.length) {
      // Skips the following white spaces.
      if (input[skip] != ' ' && input[skip] != '\t' && input[skip] != '\n') {
        break;
      }
    }

    return { Skip: skip, Label: input.substring(label_start, label_end) };
  }

  private def(input: string, skip: number, label: string): number {
    // TODO: TBD
    let end = 0;



    return 0;
  }

  private html(input: string): number {
    // TODO: TBD
    return 0;
  }

  private isBlockqute(input: string): number | undefined {
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

  private ensureBlockquoteRange(input: string, skip: number): { Skip: number, Lines: string[] } {
    let lines = []
    let end = 0;

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
        this.isBlank(input)) {
        break;
      }

      skip = 0;

      let prefix = this.isBlockqute(input);
      if (prefix == undefined) {
        break;
      }
      skip = prefix;
    }

    return { Skip: end, Lines: lines };
  }

  private blockquote(input: string, skip: number) {
    let lines = [];
    ({ Skip: skip, Lines: lines } = this.ensureBlockquoteRange(input, skip));

    // TODO: Myabe throw an error when `lines` is empty.
    let quote: blockquote = {
      Name: "BlockQuote",
      Children: [],
    }
    let oldNodes = this.nodes;
    this.nodes = quote.Children;

    let prefix = undefined;
    let i = 0;
    let line = "";
    while (i < lines.length) {
      prefix = this.isBlockqute(lines[i]);
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
    let end = 0;
    while (input.length > 0) {
      while (skip < input.length) {
        if (input[skip++] == '\n') {
          break;
        }
      }

      raw += input.substring(0, skip);
      input = input.substring(skip);
      end += skip;

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
        return end + prefix.Skip;
      }

      if (!this.isContinuationText(input)) {
        break;
      }
      skip = 0;
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
    return end;
  }

  private nodeEnter(output: string, node: node): string {
    switch (node.Name) {
      case "Blank":
        break;
      case "Heading":
        // TODO:
        output += `<h${node.Level}>`;
        break;
      case "Text":
        output += node.Text;
        break;
    }
    return output;
  }

  private nodeLevel(output: string, node: node): string {
    switch (node.Name) {
      case "Blank":
        break;
      case "Heading":
        output += `</h${node.Level}>\n`;
        break;
    }
    return output;
  }

  private render(nodes: node[], output: string, visistor: ((output: string, node: node) => string)): string {
    for (let node of nodes) {
      output = this.nodeEnter(output, node);
      output = visistor(output, node);
      output = this.nodeLevel(output, node);
    }
    return output;
  }

  private root: node[] = [];
  private nodes: node[] = this.root;
  private lastParagraph: paragraph | undefined;
};