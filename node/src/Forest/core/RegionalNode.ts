import { NTNode, } from '../util/ntnode';

export class RegionalNode {
  Node: NTNode;
  NodeID: number;
  Children: Set<number>;
  Parents: Set<number>;
  constructor(node: NTNode, parents: Set<number>) {
    this.Node = node;
    this.NodeID = node.NodeID;
    this.Children = new Set();
    this.Parents = new Set();
    this.addRelations(parents);
  }

  private addRelations(parents: Set<number>): void {
    this.addChildren();
    this.addParents(parents);
  }

  private async addChildren(): Promise<void> {
    this.Node.OutgoingEdges.forEach((edge, node) => {
      this.Children.add(node.NodeID);
    });
  }

  private async addParents(parents: Set<number>): Promise<void> {
    if (parents.size < 1) {
      return;
    }
    this.Node.IncomingEdges.forEach((edge, node) => {
      if (parents.has(node.NodeID)) {
        this.Parents.add(node.NodeID);
      }
    });
  }
}
