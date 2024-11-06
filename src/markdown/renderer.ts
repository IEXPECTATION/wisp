import { Tokens } from "./parser";

export class Renderer {
  constructor(tokens: Tokens) {
    this.tokens = tokens;
  }

  Render() {

  }

  private tokens: Tokens;
}

interface Render {
  Render(): void;
}

class HTMLRender implements Render {
  Render(): void {
    throw new Error("Method not implemented.");
  }
}

