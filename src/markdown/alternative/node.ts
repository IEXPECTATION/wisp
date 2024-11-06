interface Open {
  Open(target: Node): void;
  CanOpen(): boolean;
  LastOpened(): Node | null;
};

interface Close {
  Close(): void;
  Closed(): boolean
}

abstract class Node implements Open, Close {
  static CloseNode(target: Node) {
    target.Close();
  }

  abstract CanOpen(): boolean;

  Open(target: Node): void {
    this.nodes.push(target);
  }

  LastOpened(): Node | null {
    return this.lastOpened(this.nodes);
  }

  lastOpened(targets: Node[]): Node | null {
    let last: Node | null = targets[targets.length - 1];
    if (last.nodes.length > 0 && last.Closed()) {
      last = this.lastOpened(last.nodes);
    }
    return last;
  }

  Close(): void {
    this.closed = true;
  }

  Closed(): boolean {
    return this.closed;
  }

  private nodes: Node[] = [];
  private closed: boolean = false;
}

export class Document extends Node {
  CanOpen(): boolean {
    return true;
  }
}

export class Hr extends Node {
  CanOpen(): boolean {
    return false;
  }

}