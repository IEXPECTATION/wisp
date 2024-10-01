/*
  Line level:
    Emphasis:
      Italic -> *italic*

      Blod -> **Blod**

      Both -> ***both***

    Code -> `code`

    Link -> [example](https://www.example.com)

    image -> ![alt title](image.jpg)

  Blod Leve:
    Headings -> # Heading1
               ## Heading2
               ### Heading3
               #### Heading4
               ##### Heading5
               ###### Heading6

    Blodquotes -> > Blod quote
                  ...
    Lists:
      Ordered List -> 1. ordered list 1
                      2. ordered list 2
                      3. ordered list 3

      Unordered List -> - unordered list
                        - unordered list
                        - unordered list

    Horizontial Rule -> --- | *** | ___

    Paragraphs -> ...

    Line Breaks -> '  ' (two spaces)
*/

export module Markdown {
  export class Element {
    Tag: number;
    Text: string;
    Children: Element[];

    constructor(tag: number, text: string) {
      this.Tag = tag;
      this.Text = text;
      this.Children = [];
    }
  }

  export enum ElementTags {
    // virtual node
    Top = 0,
    BlankLine,
    Text,

    // line level elements
    Emphasis,
    Code,
    Link,
    Image,
    HTML,

    // Blod level elements
    Headings,
    Blodqoutes,
    Lists,
    Paragraphs,
    HorizontialRules,
    CodeBlods,

    // extended elements
    // ...
  }

  export class TextElement extends Element {
    constructor(text: string) {
      super(ElementTags.Text, text)
    }
  }

  export enum EmphasisKinds {
    Italic = 1,
    Blod,
    Both
  }

  export class EmphasisElement extends Element {
    Kind: number
    constructor(kind: EmphasisKinds, text: string = "") {
      super(ElementTags.Emphasis, text);
      this.Kind = kind;
    }
  }

  function emphasisHelper(kind: EmphasisKinds, begin: number, text: string): [number, Element | null] {
    let bullet = text[begin];
    let end = begin + kind;
    let emphasis = null;

    while (end < text.length && text[end] != bullet) {
      end++;
    }

    if (end >= text.length) {
      return [0, null];
    }

    for (let i = 0; i < kind; i++) {
      if (text[end + i] != bullet) {
        return [0, null];
      }
    }

    emphasis = new EmphasisElement(kind, text.substring(begin + kind, end));
    inline(emphasis);

    return [end + kind, emphasis];

  }

  export function Emphasis(element: Element) {
    let modifiedChildren: Element[] = [];
    for (let c of element.Children) {
      if (c.Tag != ElementTags.Text) {
        modifiedChildren.push(c);
        continue;
      }

      let text = c.Text;
      let begin = 0;
      let end = 0;
      let lastBegin = 0;
      let emphasis = null;
      while (true) {
        while (begin < text.length && text[begin] != '*' && text[begin] != '_') {
          begin++;
        }

        if (begin >= text.length) {
          // for suffix
          if (end != 0 && end != begin) {
            modifiedChildren.push(new TextElement(text.substring(end, begin)));
          }
          break;
        }

        if (text.length > 5 && text[begin + 1] == text[begin] && text[begin + 2] == text[begin]) {
          // Both
          let kind = EmphasisKinds.Both;
          [end, emphasis] = emphasisHelper(kind, begin, text)
        } else if (text.length > 3 && text[begin + 1] == text[begin]) {
          // Blod
          let kind = EmphasisKinds.Blod;
          [end, emphasis] = emphasisHelper(kind, begin, text)
        } else if (text.length > 2 && text[begin + 1] != text[begin]) {
          // Italic
          let kind = EmphasisKinds.Italic;
          [end, emphasis] = emphasisHelper(kind, begin, text)
        }

        // for prefix
        if (begin > lastBegin) {
          modifiedChildren.push(new TextElement(text.substring(lastBegin, begin)));
        }

        // not a emphasis element
        if (end == 0) {
          modifiedChildren.push(new TextElement(text.substring(lastBegin)));
          break;
        }

        modifiedChildren.push(emphasis!);
        begin = end;
        lastBegin = begin;
      }
    }
    element.Children = modifiedChildren;
  }

  export class CodeElement extends Element {
    constructor(text: string = "") {
      super(ElementTags.Code, text);
    }
  }

  export function Code(element: Element): void {
    throw new Error("Not Implemented!");
  }

  export class LinkElement extends Element {
    constructor(text: string = "") {
      super(ElementTags.Link, text);
    }
  }

  export function Link(element: Element): void {
    throw new Error("Not Implemented!");
  }


  export class ImageElement extends Element {
    constructor(text: string = "") {
      super(ElementTags.Image, text);
    }
  }

  export function Image(element: Element): void {

  }

  export enum HeadingLevels {
    Heading1 = 1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
  }

  export class HeadingsElement extends Element {
    Level: number;
    constructor(level: HeadingLevels, text: string = "") {
      super(ElementTags.Headings, text);
      this.Level = level;
    }
  }


  export function IsHeading(input: string): boolean {
    let eol = 0;
    if (input[eol] != '#') {
      return false;
    }

    while (eol < input.length && input[eol++] == '#') {
      if (input[eol] == ' ') {
        break;
      }
    }

    if (eol < input.length && input[eol] == ' ' && eol - 1 <= 6) {
      return true;
    }
    return false;
  }

  export function Heading(input: string): [number, Element] {
    let eol = 0;
    while (eol < input.length && input[eol++] == '#') {
      if (input[eol] == ' ') {
        break;
      }
    }

    if (eol >= input.length || input[eol] != ' ' || eol > 6) {
      throw new Error("Unknown Heading!!!");
    }
    let level = eol;

    let begin = eol + 1;
    while (eol < input.length && input[eol++] != '\n')
      ;

    let end = eol;
    if (input[end - 1] == '\n') {
      end--;
    }

    while (input[end - 1] == ' ') {
      end--;
    }

    let text = input.substring(begin, end);

    return [eol, new HeadingsElement(level, text)];
  }

  export class BlodquotesElement extends Element {
    constructor(text: string = "") {
      super(ElementTags.Blodqoutes, text);
    }
  }

  export function IsBlodQuote(input: string): boolean {
    let eol = 0;
    if (input[eol] != '>') {
      return false;
    }

    while (eol < input.length && input[eol++] == '>') {
      if (input[eol] == ' ' || input[eol] == '\n') {
        break;
      }
    }

    if (eol < input.length) {
      return true;
    }
    return false;
  }

  export function Blodquote(input: string): [number, Element] {
    let stack: BlodquotesElement[] = [];
    let indentation = 0;
    let next = 0;

    while (true) {
      let eol = 0;
      // Parses all Blodquotes whose indentation level is equal.
      while (eol < input.length && input[eol++] == '>') {
        if (input[eol++] == ' ' /* || input[end] == '\n' */) {
          break;
        }
      }

      // This line is not a Blodquote.
      if (eol == 0) {
        break;
      }

      if (eol >= input.length) {
        throw new Error("Unknown Blodquote!!!");
      }

      // Nested Blodquote.
      if (indentation < eol) {
        stack.push(new BlodquotesElement(""));
        indentation = eol;
      }

      let begin = eol;
      while (eol < input.length && input[eol++] != '\n')
        ;

      // A line is considered a separate Blod if it ends with two or more spaces.
      let end = eol;
      if (input[end - 1] == '\n') {
        end--;
      }

      let spaceCount = 0;
      while (input[end - 1] == ' ') {
        spaceCount++;
        end--;
      }

      // A blank line.
      if (eol - begin == 1) {
        next += eol;
        break;
      }

      if (begin < indentation) {
        break;
      }

      let element = stack.pop();
      element!.Text += input.substring(begin, end);
      stack.push(element!);

      if (eol >= input.length || spaceCount >= 2) {
        next += eol;
        break;
      }

      input = input.substring(eol);
      next += eol;
    }

    let top = stack.pop();
    while (stack.length != 0) {
      let parent = stack.pop();
      parent?.Children.push(top!);
      top = parent;
    }

    return [next, top!];
  }

  export enum ListsKinds {
    Ordered_List,
    Unordered_List,
    List_Item
  }

  export class ListsElement extends Element {
    Kind: ListsKinds
    constructor(kind: ListsKinds, text: string = "") {
      super(ElementTags.Lists, text);
      this.Kind = kind
    }
  }

  export function ListItem(begin: number, input: string): [number, Element] {
    let eol = begin;

    while (eol < input.length && input[eol++] != '\n')
      ;

    let end = eol;
    if (input[end - 1] == '\n') {
      end--;
    }

    while (input[end - 1] == ' ') {
      end--;
    }

    let text = input.substring(begin, end);
    return [eol, new ListsElement(ListsKinds.List_Item, text)];
  }

  export function IsOrderList(input: string) {
    let eol = 0;
    while (input[eol++] == ' ')
      ;

    while (eol < input.length) {
      if (input[eol] < '0' && input > '9') {
        return false;
      }

      if (input[eol] == '.' && eol < input.length - 1 && input[eol + 1] == ' ') {
        return true;
      }
      eol++;
    }
    return false;
  }

  export function OrderedList(input: string): [number, Element] {
    let eol = 0;
    let next = 0;
    let item = null;
    let lists = new ListsElement(ListsKinds.Ordered_List);

    while (true) {
      eol = 0;

      if (!IsOrderList(input)) {
        break;
      }

      while (eol < input.length && input[eol++] != '.')
        ;

      if (eol <= 1 || eol >= input.length) {
        break;
      }

      if (eol >= input.length || input[eol] != ' ') {
        throw new Error("Unknown Ordered List!!!");
      }

      [eol, item] = ListItem(eol + 1, input);
      lists.Children.push(item);
      lists.Text += input.substring(0, eol);
      next += eol;
      input = input.substring(eol);
    }

    return [next, lists];
  }

  export function IsUnorderedList(input: string) {
    // Unordered list
    if ((input[0] == '*' || input[0] == '-' || input[0] == "+") && input[1] == ' ') {
      return true;
    }
    return false;
  }

  export function UnorderedList(input: string): [number, Element] {
    let eol = 0;
    let next = 0;
    let item = null;
    let lists = new ListsElement(ListsKinds.Unordered_List);

    while (true) {
      if (!IsUnorderedList(input)) {
        break;
      }

      [eol, item] = ListItem(2, input);
      lists.Children.push(item);
      lists.Text += input.substring(0, eol);
      next += eol;
      input = input.substring(eol);
    }

    return [next, lists];
  }

  export class HorizontialRulesElement extends Element {
    constructor(text: string = "") {
      super(ElementTags.HorizontialRules, text);
    }
  }

  export function IsHorizontialRule(input: string): boolean {
    if (input[0] != '-' && input[0] != '_' && input[0] != '*') {
      return false;
    }

    let bullet = input[0];
    let eol = 1;
    while (eol < input.length) {
      if (input[eol] != bullet || input[eol] == '\n') {
        break;
      }
      eol++;
    }

    if (eol >= 3) {
      return true;
    }
    return false;
  }

  export function HorizontialRule(input: string): [number, Element] {
    let eol = 0;
    while (eol < input.length) {
      if (input[eol] != '_' && input[eol] != '-' && input[eol] != '*') {
        break;
      }
      eol++;
    }
    return [eol + 1, new HorizontialRulesElement(input.substring(0, eol))]
  }

  export class ParagrapshElement extends Element {
    constructor(text: string = "") {
      super(ElementTags.Paragraphs, text);
    }
  }

  export function Paragraph(input: string): [number, Element] {
    let next = 0;
    let text = "";
    while (true) {
      let eol = 0;
      while (eol < input.length && input[eol++] != '\n')
        ;

      let spaceCount = 0;
      let end = eol;

      if (input[end - 1] == '\n') {
        end--;
      }

      while (input[end - 1] == ' ') {
        spaceCount++;
        end--;
      }

      next += eol;
      text += input.substring(0, end);

      if (eol >= input.length || spaceCount >= 2) {
        break;
      }

      input = input.substring(eol);

      if (IsBlankLine(input)) {
        break;
      }
    }

    return [next, new ParagrapshElement(text)]
  }

  export class CodeBlodsElement extends Element {
    constructor(text: string = "") {
      super(ElementTags.CodeBlods, text);
    }
  }

  export function IsCodeBlod(input: string): boolean {
    let eol = 0;
    while (input[eol] == ' ') {
      eol++;
    }

    if (eol < 4) {
      return false;
    }
    return true;
  }

  export function CodeBlod(input: string): [number, Element] {
    let next = 0;
    let text = "";
    while (true) {
      if (!IsCodeBlod(input)) {
        break;
      }

      let eol = 4
      while (eol < input.length && input[eol++] != '\n')
        ;

      text += input.substring(4, eol);
      next += eol;
      input = input.substring(eol);
    }

    return [next, new CodeBlodsElement(text)];
  }

  export class HTMLElement extends Element {
    constructor(text: string = "") {
      super(ElementTags.HTML, text);
    }
  }

  export function IsBlankLine(input: string): boolean {
    let eob = 0;
    if (input[eob] == '\n') {
      return true;
    }
    return false;
  }

  export function Block(input: string = ""): Element {
    let top = new Element(ElementTags.Top, input);
    while (input != "") {
      let eob = 0;
      let element = null;
      if (IsBlankLine(input)) {
        eob = 1;
      } else if (IsHeading(input)) {
        [eob, element] = Heading(input);
        top.Children.push(element);
      } else if (IsBlodQuote(input)) {
        [eob, element] = Blodquote(input);
        top.Children.push(element);
      } else if (IsOrderList(input)) {
        [eob, element] = OrderedList(input);
        top.Children.push(element);
      } else if (IsUnorderedList(input)) {
        [eob, element] = UnorderedList(input);
        top.Children.push(element);
      } else if (IsHorizontialRule(input)) {
        [eob, element] = HorizontialRule(input)
        top.Children.push(element);
      } else if (IsCodeBlod(input)) {
        [eob, element] = CodeBlod(input);
        top.Children.push(element);
      } else {
        [eob, element] = Paragraph(input);
        top.Children.push(element);
      }

      if (eob == 0) {
        break;
      }

      input = input.substring(eob);
    }
    return top;
  }


  function inline(ast: Element) {
    let fn = (element: Element) => {
      if (element.Tag == ElementTags.Headings || element.Tag == ElementTags.Blodqoutes ||
        element.Tag == ElementTags.Lists || element.Tag == ElementTags.Paragraphs || element.Tag == ElementTags.Emphasis) {
        element.Children.push(new TextElement(element.Text));

        Emphasis(element);
      }
    };

    Walk(ast, fn);
  }


  export function Walk(node: Element, visitor: ((element: Element) => void)) {
    for (let c of node.Children) {
      Walk(c, visitor);
    }

    // Post-order
    visitor(node);
  }

  export async function Parser(input: string): Promise<Element> {
    let document = null;

    document = Block(input);
    inline(document);

    console.dir(document, { depth: Infinity });

    return document!;
  }
}

const input = `# *_Heading1_*suffix
## prefix**Heading2**
### prefix***Heading3***suffix
#### prefix***Heading4***suffixpreffix***two emphasis elements***suffix
##### **Heading5****The two emphasis elements are near each other**
###### *Heading6

> This is a Blod quote!
>> This is another Blod quote!
>> test Blod quote

1. ordered list 1
2. ordered list 2
3. ordered list 3

* this is a unordered list 1

- this is the other unordered list 2

+ this is another unordered list3

---

***

___

Here is a demo paragraph.

    console.log("This line is a code Blod");
    console.log("This line is another code Blod");

`;

(async () => {
  let e = await Markdown.Parser(input);
  // console.dir(e, { depth: Infinity });
})();
