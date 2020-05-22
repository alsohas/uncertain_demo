import { NTNode, } from './ntnode';

/* eslint-disable @typescript-eslint/no-namespace */
export class Edge {
  Source: NTNode;
  Destination: NTNode;
  EdgeID: number;

  /**
   *Creates an instance of Edge.
   * @param {NTNode} source
   * @param {NTNode} destination
   * @memberof Edge
   */
  constructor(source: NTNode, destination: NTNode) {
    this.Source = source;
    this.Destination = destination;
    this.EdgeID = parseInt(this.Source.NodeID.toString() + this.Destination.NodeID.toString());
  }
}
