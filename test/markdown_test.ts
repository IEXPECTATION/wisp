import { exit } from "process";
import { Lexer, Tokenizer } from "../src/markdown";

let lex = new Lexer(new Tokenizer());

// let input = "``` c \nprintf(\"Hello World\");\n return 0;\n```";
// let input = `1. asb
//    bcd
// asdasdasd

// 2. asd`

let input  = `> > asd
> ---
> asd
asdasd
***
`
// lex.Lex(input);
lex.BlockQuote(input);
console.dir(lex.nodes, { depth: Infinity });
