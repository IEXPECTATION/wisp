import { Block } from "./block";

export interface Processer {
  open(scanner: Scanner): Block;
  match(block: Block, scanner: Scanner): boolean;
}
