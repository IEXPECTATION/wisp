import { Block, BLOCKTAG, Document } from "./block";

export class Parser {
  constructor(private readonly scanner: Scanner) { }

  open_new_blocks(): void {

  }

  match_opened_blocks(): void {
    let matched = this.root;
    while (matched.has_child()) {
      if (!matched.last_child_opened()) {
        break;
      }


      const child = matched.last_child();
      if (child) {
        matched = child
      } else {
        break;
      }
    }

    // If we could not match any opened blocks and the pending is empty, we should set current to root.
    if (matched == this.root && this.pending == "") {
      this.current = this.root;
    }
  }

  private pending: string = "";
  private root: Block = new Document();
  private current: Block = this.root;
}
