export type Block = ContainerBlock | LeafBlock;


class ContainerBlock {
  constructor(public readonly children: Block[] = []) {

  }
}

class LeafBlock {
  constructor(public readonly content: string) {

  }
}

