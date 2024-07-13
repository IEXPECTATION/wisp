// export type Token = rawToken | textToken | headingToken | codeToken | blockQuoteToken | listToken | listItemToken;

// type rawToken = {
//   Raw: string;
// };

// type textToken = {
//   Raw: string;
//   Text: string;
// };

// type headingToken = {
//   Raw: string;
//   Text: string;
//   Level: number;
// };

// type codeToken = {
//   Raw: string;
//   Text: string;
//   Language: string;
// };

// type blockQuoteToken = {
//   Raw: string;
//   Text: string;
//   Continuation: string;
// }

// type listToken = {
//   Type: string;
//   Raw: string;
//   Bullet: string;
//   Item: Token[] | undefined;
// };

// type listItemToken = {
//   Raw: string;
//   Text: string;
//   MultipleBlocks: boolean
// }

// type MarkdownConfig = {

// };

// type whiteSpaceSpan = {
//   Offset: number,
//   Count: number,
// };

// enum InterruptOption {
//   Blank = 1,
//   Heading = 1 << 1,
//   Hr = 1 << 2,
//   FencedCode = 1 << 3,
//   IndentedCode = 1 << 4,
//   Def = 1 << 5,
//   HTML = 1 << 6,
//   BlockQuote = 1 << 7,
//   List = 1 << 8,
// }

// export class Tokenizer {
//   constructor() {
//     this.tabSize = 4;
//   }

//   Blank(input: string): Token | undefined {
//     let raw = "";
//     while (input.length) {
//       let { Offset: offset, Count: count } = this.skipLeaddingWhiteSpace(input);
//       if (count < input.length && input[offset] != '\n') {
//         break;
//       }

//       if (offset < input.length) {
//         offset++;
//       }

//       raw += input.substring(0, offset);
//       input = input.substring(offset);
//     }

//     if (raw == "") {
//       return undefined;
//     }

//     return { Raw: raw };
//   }

//   private headingPrefix(input: string): ({ Offset: number, Level: number } | undefined) {
//     let { Offset: offset, Count: count } = this.skipLeaddingWhiteSpace(input);
//     if (count >= this.tabSize || offset == input.length) {
//       return undefined;
//     }

//     if (input[offset++] != '#') {
//       return undefined;
//     }

//     let level = 1;
//     while (offset < input.length && input[offset] == '#') {
//       level++;
//       offset++;
//     }

//     if (offset == input.length || input[offset++] != ' ') {
//       return undefined;
//     }

//     return { Offset: offset, Level: level };
//   }

//   Heading(input: string): Token | undefined {
//     let prefix = this.headingPrefix(input);
//     if (prefix == undefined) {
//       return undefined;
//     }

//     let begin = prefix.Offset;
//     while (true) {
//       if (prefix.Offset == input.length || input[prefix.Offset] == '\n') {
//         break;
//       }
//       prefix.Offset++;
//     }

//     let end = prefix.Offset;

//     while (input[end - 1] == ' ') {
//       end--;
//     }

//     // Delete the next blank lines.
//     while (++prefix.Offset < input.length && input[prefix.Offset] == '\n');

//     let raw = input.substring(0, prefix.Offset);
//     let text = input.substring(begin, end);
//     return { Raw: raw, Text: text, Level: prefix.Level };
//   }

//   Hr(input: string): Token | undefined {
//     let { Offset: offset, Count: count } = this.skipLeaddingWhiteSpace(input);
//     if (count >= this.tabSize || offset == input.length) {
//       return undefined;
//     }

//     let bullet = input[offset++];
//     if (bullet != '-' && bullet != '*' && bullet != '_') {
//       return undefined;
//     }

//     count = 1;
//     while (true) {
//       if (offset == input.length || input[offset] == '\n') {
//         break;
//       }

//       if (input[offset] == bullet) {
//         count++;
//       } else if (input[offset] == ' ') {
//       } else {
//         return undefined;
//       }
//       offset++;
//     }

//     if (count < 3) {
//       return undefined;
//     }

//     while (++offset < input.length && input[offset] == '\n');

//     return { Raw: input.substring(0, offset) };
//   }

//   private fencedCodePrefix(input: string): ({ Offset: number, Bullet: string, Count: number } | undefined) {
//     let { Offset: offset, Count: count } = this.skipLeaddingWhiteSpace(input);
//     if (count >= this.tabSize || offset == input.length) {
//       return undefined;
//     }

//     let bullet = input[offset];
//     if (bullet != '`' && bullet != '~') {
//       return undefined;
//     }

//     count = 1;
//     while (++offset < input.length && input[offset] == bullet) {
//       count++;
//     }

//     if (count < 3) {
//       return undefined;
//     }

//     return { Offset: offset, Bullet: bullet, Count: count };
//   }

//   FencedCode(input: string): Token | undefined {
//     let prefix = this.fencedCodePrefix(input);
//     if (prefix == undefined) {
//       return undefined;
//     }

//     if (prefix.Offset == input.length) {
//       return { Raw: "", Text: input, Language: "" };
//     }

//     let openCount = prefix.Count;
//     // Verify if there is a designated language.
//     // Remove the white space following open tag.
//     while (input[prefix.Offset] == ' ' || input[prefix.Offset] == '\t') {
//       prefix.Offset++;
//     }

//     let language = "";
//     if (input[prefix.Offset] != '\n') {
//       // There is a specified language in the fenen code block.
//       let start = prefix.Offset;
//       while (prefix.Offset < input.length && input[prefix.Offset] != '\n') {
//         prefix.Offset++;
//       }

//       let trim = prefix.Offset;
//       while (trim > start) {
//         let c = input[trim - 1];
//         if (c != ' ' && c != '\t') {
//           break;
//         }
//         trim--;
//       }
//       language = input.substring(start, trim);
//     }

//     // Skip the current line feed if there are some characters following it.
//     if (prefix.Offset < input.length) {
//       prefix.Offset++;
//     }

//     let text = "";
//     let raw = input.substring(0, prefix.Offset);

//     // Don't have closing tag.
//     if (prefix.Offset == input.length) {
//       return { Text: text, Raw: raw, Language: language };
//     }

//     input = input.substring(prefix.Offset);
//     // Scan the following lines, find the closing tag.
//     while (input.length) {
//       ({ Offset: prefix.Offset, Count: prefix.Count } = this.skipLeaddingWhiteSpace(input));

//       if (prefix.Count < this.tabSize && input[prefix.Offset] == prefix.Bullet) {
//         // Check whether this line is closing tag.
//         prefix.Count = 1;
//         while (++prefix.Offset < input.length && input[prefix.Offset] == prefix.Bullet) {
//           prefix.Count++;
//         }

//         if (prefix.Count == openCount) {
//           // Recognize a closing tag.
//           while (prefix.Offset < input.length && input[prefix.Offset] == '\n') {
//             prefix.Offset++;
//           }

//           raw += input.substring(0, prefix.Offset);
//           return { Text: text, Raw: raw, Language: language };
//         }
//       }

//       // This is a line of code. Find the next line feed '\n'.
//       while (prefix.Offset < input.length && input[prefix.Offset++] != '\n');

//       let line = input.substring(0, prefix.Offset);
//       text += line;
//       raw += line;
//       input = input.substring(prefix.Offset);
//     }

//     // Don't have closing tag.
//     return { Text: text, Raw: raw, Language: language };
//   }

//   private indentedCodePrefix(input: string): (number | undefined) {
//     let { Offset: offset, Count: count } = this.skipLeaddingWhiteSpace(input);
//     if (count < this.tabSize || offset == input.length) {
//       return undefined;
//     }
//     return offset;
//   }

//   IndentedCode(input: string): Token | undefined {
//     let offset = this.indentedCodePrefix(input);
//     if (offset == undefined) {
//       return undefined;
//     }

//     let count = 0;
//     let text = "";
//     let raw = "";
//     let start = this.tabSize, end = offset;

//     while (true) {
//       // find the end of current line.
//       while (end < input.length && input[end] != '\n') {
//         end++;
//       }

//       if (end < input.length) {
//         end++;
//       }

//       text += input.substring(start, end);
//       raw += input.substring(0, end);
//       if (end == input.length) {
//         break;
//       }
//       start = end;

//       input = input.substring(end);
//       ({ Offset: offset, Count: count } = this.skipLeaddingWhiteSpace(input));
//       if (count < this.tabSize || offset == input.length) {

//         if (input[offset] == '\n') {
//           while (++offset < input.length && input[offset] == '\n');
//           raw += input.substring(0, offset);
//         }
//         break;
//       }
//       start = end = this.tabSize;
//     }

//     return { Raw: raw, Text: text };
//   }

//   Def(input: string): Token | undefined {
//     return undefined;
//   }

//   HTML(input: string): Token | undefined {
//     return undefined;
//   }

//   private blockQuotePrefix(input: string): (number | undefined) {
//     let { Offset: offset, Count: count } = this.skipLeaddingWhiteSpace(input);
//     if (count >= this.tabSize || offset == input.length) {
//       return undefined;
//     }

//     if (input[offset] != '>') {
//       return undefined;
//     }

//     if (input[++offset] == ' ') {
//       offset++;
//     }

//     return offset;
//   }

//   BlockQuote(input: string): Token | undefined {
//     let offset = this.blockQuotePrefix(input);
//     if (offset == undefined) {
//       return undefined;
//     }

//     let inQuote = true;
//     let raw = "";
//     let text: string = "";
//     let continuation: string = "";
//     let origin = offset;
//     do {
//       // Accept the current line.
//       while (offset < input.length && input[offset] != '\n') {
//         offset++;
//       }
//       if (offset < input.length) {
//         offset++;
//       }

//       raw += input.substring(0, offset);
//       let line = input.substring(origin, offset);
//       if (inQuote) {
//         // Skip the empty line starts with '>'.
//         if (this.Blank(line) == undefined) {
//           text += line;
//         }
//       } else {
//         continuation += line;
//       }


//       if (offset == input.length) {
//         break;
//       }

//       input = input.substring(offset);
//       offset = this.blockQuotePrefix(input);
//       if (offset == undefined) {
//         if (this.shouldInterrupt(input)) {
//           break;
//         }

//         // This line is a continuation.
//         inQuote = false;
//         offset = 0;
//       } else {
//         inQuote = true;
//       }

//       origin = offset;
//     } while (true);

//     return { Raw: raw, Text: text, Continuation: continuation };
//   }

//   List(input: string, interrupt: boolean = false): Token | undefined {
//     let { Offset: offset, Count: count } = this.skipLeaddingWhiteSpace(input);

//     if (count >= this.tabSize || offset == input.length) {
//       return undefined;
//     }

//     let type = "unordered list";
//     let bullet = "";
//     let raw = "";
//     let item = undefined;
//     let items = [] as Token[];

//     if ((input[offset] == '*' || input[offset] == '-' || input[offset] == '+') &&
//       (++offset < input.length && input[offset] == ' ')) {
//       bullet = input[offset];

//       if (interrupt) {
//         return { Type: type, Raw: input.substring(0, offset), Bullet: bullet, Item: undefined };
//       }
//     } else {
//       type = 'ordered list';
//       let zero = false;
//       let leading = true;
//       while (offset < input.length) {
//         if (input[offset] == '.' || input[offset] == ')') {
//           if (leading && zero) {
//             bullet += '0';
//           }
//           break;
//         }

//         if (input[offset] >= '0' && input[offset] <= '9') {
//           if (input[offset] == '0') {
//             if (!leading) {
//               bullet += '0';
//             }
//             zero = true;
//           } else {
//             bullet += input[offset];
//             leading = false;
//             zero = false;
//           }
//         } else {
//           // Not a number.
//           return undefined;
//         }

//         if (bullet.length > 9) {
//           return undefined;
//         }
//         offset++;
//       }

//       if (++offset < input.length && input[offset] != ' ') {
//         return undefined;
//       }

//       if (offset < input.length) {
//         offset++;
//       }

//       if (interrupt && bullet == '1') {
//         return { Type: type, Raw: input.substring(0, offset), Bullet: bullet, Item: undefined, }
//       }
//     }

//     while (true) {
//       raw += input.substring(0, offset);
//       input = input.substring(offset);
//       // TODO: Change the return value of ListItem to `{token: Token, interrupt: boolean}`.
//       ({ token: item, interrupt } = this.ListItem(input, offset));
//       if (interrupt == true) {
//         break;
//       }
//       raw += item.Raw;
//       items.push(item);
//       input = input.substring(item.Raw.length);

//       if (input.length == 0) {
//         break;
//       }
//     }

//     return { Type: type, Raw: raw, Bullet: bullet, Item: items };
//   }

//   ListItem(input: string, indent: number): { token: Token, interrupt: boolean } {
//     // ListItem(input: string, indent: number): Token | undefined {
//     /*
//       A list item should start with the same indent if the line is separated by blank line. This indent include the list mark.

//       - a           <ul>
//             ==>         <li>
//         b                   <p>a</p>
//                             <p>b</p>
//                         </li>
//                     </ul>

//       If the content is separated by blank line and the indent is not same, It indicates the end of list item.

//       - a           <ul>
//            ==>          </li>a</li>
//       b             </ul>
//                     <p>b</p>


//       If the content is not separated by blank line and spans the multiple lines, we should treat it as a single line.

//       - a  ==>    <ul>
//       b               <li>a
//                       b</li>
//                   </ul>
//     */
//     let offset = 0, _ = 0;
//     let raw = "", text = "";
//     let single = true;

//     while (true) {
//       while (offset < input.length && input[offset++] != '\n')
//         ;

//       text = raw = input.substring(0, offset);
//       if (offset == input.length) {
//         return { token: { Raw: raw, Text: text, MultipleBlocks: single }, interrupt: false };
//       }

//       // Check the indent of next line.
//       input = input.substring(offset);

//       // Check the next lien whether a blank line.
//       let separated = false;
//       let blocks = 0;
//       while (true) {
//         let token = this.Blank(input);
//         if (token != undefined) {
//           raw += token.Raw;
//           input = input.substring(token.Raw.length);
//           separated = true;
//           blocks++;
//         }

//         ({ Offset: offset, Count: _ } = this.skipLeaddingWhiteSpace(input));

//         let origin = offset;
//         // It's the end of list item, if the indent of next line is less than `indent`
//         if (separated && offset < indent) {
//           return { token: { Raw: raw, Text: text, MultipleBlocks: single }, interrupt: false };
//         }

//         while (offset < input.length && input[offset++] != '\n');

//         raw += input.substring(0, offset);
//         if (origin > indent) {
//           origin = indent;
//         }
//         text += input.substring(origin, offset);

//         if (offset == input.length) {
//           return { token: { Raw: raw, Text: text, MultipleBlocks: single }, interrupt: false };
//         }
//         input = input.substring(offset);

//         token = this.List(input, true);
//         if (token != undefined) {
//           return { token: { Raw: raw, Text: text, MultipleBlocks: single }, interrupt: false };
//         }
//       }
//     }
//   }

//   Paragraph(input: string): Token | undefined {
//     return undefined;
//   }

//   private shouldInterrupt(input: string): boolean {
//     /*
//       Intended code cannot interrupt the paragraph.
//       Setext heading cannot interrupt the paragraph.
//       Link reference definition cannot interrupt the paragraph.
//     */

//     if (this.Blank(input) != undefined) {
//       return true;
//     }

//     if (this.headingPrefix(input) != undefined) {
//       return true;
//     }

//     if (this.Hr(input) != undefined) {
//       return true;
//     }

//     if (this.fencedCodePrefix(input) != undefined) {
//       return true;
//     }

//     if (this.indentedCodePrefix(input) != undefined) {
//       return true;
//     }

//     if (this.HTML(input) != undefined) {
//       return true;
//     }

//     if (this.blockQuotePrefix(input) != undefined) {
//       return true;
//     }

//     // Only the first item of ordered list and unordered list can interrupt the paragraph.
//     if (this.List(input, true)) {
//       return false;
//     }

//     return false;
//   }

//   private skipLeaddingWhiteSpace(input: string, offset: number = 0): whiteSpaceSpan {
//     let count = 0;

//     while (true) {
//       if (input[offset] == ' ') {
//         count++;
//       } else if (input[offset] == '\t') {
//         count += 4;
//       } else {
//         break;
//       }
//       offset++;
//     }
//     return { Offset: offset, Count: count };
//   }

//   private tabSize: number;
//   private tokenizerConfig: undefined;
// };

// type Nodes = Node[];

// interface Node {
//   Name: string;
//   Token: Token;
//   Children: Nodes | undefined;
// };

// export class Lexer {
//   constructor(tokenizer: Tokenizer) {
//     this.tokenizer = tokenizer;
//   }

//   Lex(input: string): void {
//     let number = 0;
//     while (input.length > 0) {
//       if ((number = this.Blank(input)) > 0) {
//         input = input.substring(number);
//         continue;
//       }

//       if ((number = this.Heading(input)) > 0) {
//         input = input.substring(number);
//         continue;
//       }

//       if ((number = this.Hr(input)) > 0) {
//         input = input.substring(number);
//         continue;
//       }

//       if ((number = this.FencedCode(input)) > 0) {
//         input = input.substring(number);
//         continue;
//       }

//       if ((number = this.IndentedCode(input)) > 0) {
//         input = input.substring(number);
//         continue;
//       }

//       if ((number = this.Def(input)) > 0) {
//         input = input.substring(number);
//         continue;
//       }

//       if ((number = this.HTML(input)) > 0) {
//         input = input.substring(number);
//         continue;
//       }

//       if ((number = this.BlockQuote(input)) > 0) {
//         input = input.substring(number);
//         continue;
//       }

//       if ((number = this.List(input)) > 0) {
//         input = input.substring(number);
//         continue;
//       }

//       break;
//     }
//   }

//   Blank(input: string): number {
//     let token = this.tokenizer.Blank(input);
//     if (token == undefined) {
//       return 0;
//     }

//     this.nodes.push({
//       Name: "Blank",
//       Token: token,
//       Children: undefined,
//     })
//     return token.Raw.length;
//   }

//   Heading(input: string): number {
//     let token = this.tokenizer.Heading(input);
//     if (token == undefined) {
//       return 0;
//     }

//     // TODO: parse the inline text.
//     this.nodes.push({
//       Name: "Heading",
//       Token: token,
//       Children: []
//     })
//     return token.Raw.length;
//   }

//   Hr(input: string): number {
//     let token = this.tokenizer.Hr(input);
//     if (token == undefined) {
//       return 0;
//     }

//     this.nodes.push({
//       Name: "Hr",
//       Token: token,
//       Children: undefined,
//     })

//     return token.Raw.length;
//   }

//   FencedCode(input: string): number {
//     let token = this.tokenizer.FencedCode(input);
//     if (token == undefined) {
//       return 0;
//     }

//     this.nodes.push({
//       Name: "FencedCode",
//       Token: token,
//       Children: undefined,
//     })

//     return token.Raw.length;
//   }

//   IndentedCode(input: string): number {
//     let token = this.tokenizer.IndentedCode(input);
//     if (token == undefined) {
//       return 0;
//     }

//     this.nodes.push({
//       Name: "IndentedCode",
//       Token: token,
//       Children: undefined,
//     })

//     return token.Raw.length;
//   }

//   Def(input: string): number {
//     let token = this.tokenizer.Def(input);
//     if (token == undefined) {
//       return 0;
//     }

//     // TODO: parse the inline text.
//     this.nodes.push({
//       Name: "Def",
//       Token: token,
//       Children: []
//     })

//     return token.Raw.length;
//   }

//   HTML(input: string): number {
//     let token = this.tokenizer.HTML(input);
//     if (token == undefined) {
//       return 0;
//     }

//     // TODO: parse the inline text.
//     this.nodes.push({
//       Name: "HTML",
//       Token: token,
//       Children: []
//     })

//     return token.Raw.length;
//   }

//   BlockQuote(input: string): number {
//     let token = this.tokenizer.BlockQuote(input) as blockQuoteToken;
//     if (token == undefined) {
//       return 0;
//     }

//     let nodes: Nodes = [];
//     let oldNodes = this.nodes;
//     this.nodes = nodes;

//     if (token.Text.length > 0) {
//       this.Lex(token.Text);
//     }

//     if (token.Continuation.length > 0) {
//       // Check whether the last node is paragraph.
//       let lastNode = nodes[nodes.length - 1];
//       if (lastNode.Name == "Paragraph") {
//         (lastNode.Token as textToken).Raw += token.Continuation;
//         (lastNode.Token as textToken).Text += token.Continuation;
//       } else {
//         // Otherwise, we create a new paragraph for the continuation.
//         let p: Node = {
//           Name: "Paragraph",
//           Token: {
//             Raw: token.Continuation,
//             Text: token.Continuation
//           },
//           Children: []
//         }
//         nodes.push(p);
//       }
//     }

//     let node: Node = {
//       Name: "BlockQuote",
//       Token: token,
//       Children: nodes,
//     }
//     oldNodes.push(node);
//     this.nodes = oldNodes;

//     return token.Raw.length;
//   }

//   List(input: string): number {
//     let token = this.tokenizer.List(input);
//     if (token == undefined) {
//       return 0;
//     }

//     return token.Raw.length;
//   }

//   ListItem(input: string): number {
//     return 0;
//   }

//   Paragraph(input: string): number {
//     return 0;
//   }

//   private tokenizer: Tokenizer;
//   nodes: Nodes = [];
// }

// export class Parser {
//   constructor() {
//     this.root = [];
//   }

//   private root: Node[];
// };

// export class Rendered {
//   constructor() {

//   }
// };

// export class Markdown {
//   constructor() {

//   }
// }

const TabSize = 4;

type token = heading | hr | code;

type heading = {
  Name: "Heading",
  Raw: string,
  Text: string,
  Level: number,
}

type hr = {
  Name: "Hr",
}

type code = {
  Name: "FencedCode" | "IndentedCode"
  Raw: string,
  Text: string,
  Language: string
}

class Parser {
  Main() {
    let input = `
# Heading



** *
\`\`\` c
printf("Hello World");
\`\`\`
`;
    this.Parse(input);

    console.dir(this.nodes, { depth: Infinity });
  }

  Parse(input: string) {
    let skip = 0;
    while (input.length > 0) {
      if ((skip = this.blank(input)) > 0) {
        input = input.substring(skip);
        continue;
      }

      if ((skip = this.hr(input)) > 0) {
        input = input.substring(skip);
        continue;
      }

      if ((skip = this.heading(input)) > 0) {
        input = input.substring(skip);
        continue;
      }

      if ((skip = this.fencedCode(input)) > 0) {
        input = input.substring(skip);
        continue;
      }

      break;
    }
  }

  private blank(input: string): number {
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

    return skip;
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

    this.nodes.push(({
      Name: "Heading",
      Raw: input.substring(0, skip),
      Text: input.substring(prefix.Skip, end),
      Level: prefix.Level
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

    this.nodes.push({ Name: "Hr" });

    return skip;
  }

  private fencedCodePrefix(input: string): { Skip: number, Bullet: string, Length: number } | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpace } = this.skipLeaddingWhiteSpace(input);
    if (numberOfSpace >= TabSize || skip == input.length) {
      return undefined;
    }
    let bullet = input[skip];
    if (bullet != '`' && bullet != '~') {
      return undefined;
    }
    numberOfSpace = 1;
    while (++skip < input.length && input[skip] == bullet) {
      numberOfSpace++;
    }
    if (numberOfSpace < 3) {
      return undefined;
    }
    return { Skip: skip, Bullet: bullet, Length: numberOfSpace };
  }

  private fencedCode(input: string): number {
    let prefix = this.fencedCodePrefix(input);
    if (prefix == undefined) {
      return 0;
    }

    let skip = prefix.Skip;
    if (skip == input.length) {
      // Here is a open tag, but don't follow a close tag.
      this.nodes.push({
        Name: "FencedCode",
        Raw: input.substring(0, skip),
        Text: "",
        Language: ""
      });
      return skip;
    }

    // Verify if there is a designated language.
    // Remove the white space following open tag.
    while (input[skip] == ' ' || input[skip] == '\t') {
      skip++;
    }
    let language = "";
    if (input[skip] != '\n') {
      // There is a specified language in the fenen code block.
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

    // Skip the current line feed if there are some characters following it.
    if (skip < input.length) {
      skip++;
    }

    // Skip the current line feed if there are some characters following it.
    let text = "";
    let raw = input.substring(0, skip);

    // Don't have closing tag.
    if (skip == input.length) {
      this.nodes.push({
        Name: "FencedCode",
        Raw: raw,
        Text: text,
        Language: language
      });
      return skip;
    }

    input = input.substring(skip);
    let lengthOfOpeningTag = prefix.Length;
    let bullet = prefix.Bullet;

    // Scan the following lines, find the closing tag.
    while (input.length) {
      prefix = this.fencedCodePrefix(input);
      if (prefix != undefined) {
        if (prefix.Length == lengthOfOpeningTag && prefix.Bullet == bullet) {
          raw += input.substring(0, prefix.Skip);
          this.nodes.push({
            Name: "FencedCode",
            Raw: raw,
            Text: text,
            Language: language
          });
          return prefix.Skip;
        }
      }

      while (skip < input.length && input[skip++] != '\n');
      let line = input.substring(0, skip);
      text += line;
      raw += line;
      input = input.substring(skip);
    }

    // Don't have closing tag.
    this.nodes.push({
      Name: "FencedCode",
      Raw: raw,
      Text: text,
      Language: language
    });

    return raw.length;
  }

  private indentedCodePrefix(input: string): { Skip: number, NumbserOfSpace: number } | undefined {
    let { Skip: skip, NumberOfSpaces: numberOfSpaces } = this.skipLeaddingWhiteSpace(input);
    if (skip < input.length && numberOfSpaces >= TabSize) {
      return { Skip: skip, NumbserOfSpace: numberOfSpaces };
    }

    return undefined;
  }

  private indentedCode(input: string): number {
    return 0;
  }

  private stack: token[] = [];
  private root: token[] = [];
  private nodes: token[] = this.root;
}

let p = new Parser();
p.Main();