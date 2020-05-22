import { NTNode, } from '../util/ntnode';

export class RegionalNode {
  Node: NTNode;
  NodeID: number;
  Children: Set<number>;
  Parents: Set<number>;

  /**
   *Creates an instance of RegionalNode.
   * @param {NTNode} node
   * @param {Set<number>} parents
   * @memberof RegionalNode
   */
  constructor(node: NTNode, parents: Set<number>) {
    this.Node = node;
    this.NodeID = node.NodeID;
    this.Children = new Set();
    this.Parents = new Set();
    this.addRelations(parents);
  }

  /**
   * Adds parent/child relations to incoming and outgoing nodes
   *
   * @private
   * @param {Set<number>} parents
   * @memberof RegionalNode
   */
  private addRelations(parents: Set<number>): void {
    this.addChildren();
    this.addParents(parents);
  }

  /**
   * Adds outgoing nodes as children.
   *
   * @private
   * @returns {Promise<void>}
   * @memberof RegionalNode
   */
  private async addChildren(): Promise<void> {
    this.Node.OutgoingEdges.forEach((edge, node) => {
      this.Children.add(node.NodeID);
    });
  }

  /**
   * Adds incoming nodes as parents
   *
   * @private
   * @param {Set<number>} parents
   * @returns {Promise<void>}
   * @memberof RegionalNode
   */
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
