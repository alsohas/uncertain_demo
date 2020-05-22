import { Edge, } from './edge';

export class NTNode {
  public NodeID: number;
  public Location: L.LatLng;

  public IncomingEdges: Map<NTNode, Edge>;
  public OutgoingEdges: Map<NTNode, Edge>;

  constructor(nodeID: number, latLng: L.LatLng) {
    this.NodeID = nodeID;
    this.Location = latLng;
    this.OutgoingEdges = new Map();
    this.IncomingEdges = new Map();
  }

  /**
   * Adds relation to all outgoing edges
   *
   * @param {NTNode} node
   * @param {Edge} edge
   * @returns {void}
   * @memberof NTNode
   */
  public AddOutgoingEdge(node: NTNode, edge: Edge): void {
    if (!(node.NodeID in this.OutgoingEdges)) {
      this.OutgoingEdges.set(node, edge);
    }
    if (node.IncomingEdges.has(this)) {
      return;
    }
    node.AddIncomingEdge(this, edge);
  }

  /**
   * Adds relation to all incoming edges
   *
   * @param {NTNode} node
   * @param {Edge} edge
   * @returns {void}
   * @memberof NTNode
   */
  public AddIncomingEdge(node: NTNode, edge: Edge): void {
    if (!(node.NodeID in this.IncomingEdges)) {
      this.IncomingEdges.set(node, edge);
    }
    if (node.OutgoingEdges.has(this)) {
      return;
    }
    node.AddOutgoingEdge(this, edge);
  }
}
