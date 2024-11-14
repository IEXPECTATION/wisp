import { Node, NodeTag } from "./nodes";

export class Renderer {

  Render(root: Node) {

  }

  private visitor(target: Node) {
    this.entryNode(target.Tag);

    for (let node of target.Children()) {
      this.visitor(node);
    }

    this.leaveNode(target.Tag);
  }

  private entryNode(tag: NodeTag) {
    switch (tag) {

    }
  }

  private leaveNode(tag: NodeTag) {
    switch (tag) {

    }
  }
}

interface Render {
  Render(): void;
}

class HTMLRender implements Render {
  Render(): void {
    throw new Error("Method not implemented.");
  }
}

