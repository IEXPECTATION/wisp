import { Parser } from "./parser"
import { Scanner } from "./scanner";

let input = ">> abc\n>>> def\nghi\n# abc";
let scanner = new Scanner(input);
const p = new Parser(scanner);
p.parse();
console.dir(p.root, { depth: Infinity });

// test("common test", () => {
// })
