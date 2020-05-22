/* eslint-disable @typescript-eslint/no-explicit-any */
import { NTNode, } from './ntnode';
import { Edge, } from './edge';
import * as nodes from '../../../data/nodes.json';
import * as edges from '../../../data/edges.json';

import L from 'leaflet';
import { getDist, } from '../../map_utils/DomUtils';

export class RoadNetwork {
  public Nodes: Map<number, NTNode>;
  public Edges: Map<number, Edge>;

  private static instance: RoadNetwork;

  private constructor() {
    this.Nodes = new Map();
    this.Edges = new Map();
  }

  /**
   * Instance provider for singleton pattern
   *
   * @static
   * @returns {RoadNetwork}
   * @memberof RoadNetwork
   */
  public static getInstance(): RoadNetwork {
    if (!RoadNetwork.instance) {
      RoadNetwork.instance = new RoadNetwork();
    }
    return RoadNetwork.instance;
  }

  public async Build(): Promise<void> {
    await this.InitializeNodes();
    await this.InitializeEdges();
    await this.BuildRoadNetwork();
  }

  /**
   * Initializes the graph construction once nodes and edges
   * have been added
   *
   * @private
   * @returns {Promise<void>}
   * @memberof RoadNetwork
   */
  private async BuildRoadNetwork(): Promise<void> {
    this.Edges.forEach((edge) => {
      const sourceNode = edge.Source;
      const destinationNode = edge.Destination;
      sourceNode.AddOutgoingEdge(destinationNode, edge);
      destinationNode.AddIncomingEdge(sourceNode, edge);
    });
  }

  /**
   * Adds edges to the road network
   *
   * @private
   * @returns {Promise<void>}
   * @memberof RoadNetwork
   */
  private async InitializeEdges(): Promise<void> {
    for (const _edge in edges) {
      const source = parseInt(edges[_edge][0]);
      const destination = parseInt(edges[_edge][1]);
      if (this.Nodes.has(source) && this.Nodes.has(destination)) {
        const sourceNode = this.Nodes.get(source) as NTNode;
        const destinationNode = this.Nodes.get(destination) as NTNode;
        const edge = new Edge(sourceNode, destinationNode);
        if (this.Edges.has(edge.EdgeID)) {
          continue;
        } else {
          this.Edges.set(edge.EdgeID, edge);
        }
      }
    }
  }

  /**
   * Adds nodes to the network
   *
   * @private
   * @returns {Promise<void>}
   * @memberof RoadNetwork
   */
  private async InitializeNodes(): Promise<void> {
    for (const _node in nodes) {
      let lng!: number;
      let lat!: number;
      let id!: number;
      for (const _nodeInfo in nodes[_node]) {
        if (_nodeInfo === 'coordinate') {
          lng = nodes[_node][_nodeInfo]['long'];
          lat = nodes[_node][_nodeInfo]['lat'];
        } else if (_nodeInfo === 'id') {
          id = nodes[_node][_nodeInfo];
        }
      }
      if (lng && lat && id) {
        const ntNode = new NTNode(id, new L.LatLng(lat, lng));
        this.Nodes.set(ntNode.NodeID, ntNode);
      }
    }
  }

  /**
   * Returns nodes within a region defined by a center and
   * user given radius
   *
   * @static
   * @param {L.LatLng} center
   * @returns {Promise<Array<number>>}
   * @memberof RoadNetwork
   */
  public static async getNodesWithinRange(
    center: L.LatLng
  ): Promise<Array<number>> {
    const response = (await fetch('http://localhost:5000/getNodesWithinRange', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        lat: center.lat,
        lng: center.lng,
        radius: getDist(),
      }),
    }).catch((err) => {
      console.log('Something went wrong grabbing connected nodes');
      console.log(err);
    })) as Response;
    const nodes = (await response.json()) as Array<number>;
    return nodes;
  }
}
