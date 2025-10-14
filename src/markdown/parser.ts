import { Node, NODETAG } from "./node";
import { Scanner } from "./scanner";

export class Parser {
  constructor(private readonly scanner: Scanner) { }

  parse(): void {

  }

  open_new_blocks(): void {
     
  }

  match_opened_blocks(): void {
    let matched = this.root;
    while (matched.has_children()) {
      if(!matched.is_last_element_opened()) {
        break;
      }
      
      const child = matched.get_last_node()!;
      let ok = child.process!.match(child.element!, this.scanner);
      if(!ok) {
        break; 
      }
      matched = child;
    }

    if(matched != this.root && this.pending == "") {
      this.current = matched;
    }
  }

  private pending: string = "";
  private root: Node = new Node(NODETAG.Document);
  private current: Node = this.root;
  private row: number = 0;
  private column: number = 0;
}
