import { RegionalNode, } from './RegionalNode';
import { NTNode, } from '../util/ntnode';

export class Region {
  private static instance: Region;

  public Regions: Map<number, Map<number, RegionalNode>>;
  public ObsoleteNodes: Map<number, Set<number>>;

  /**
   *Creates an instance of Region.
   * @memberof Region
   */
  private constructor() {
    this.Regions = new Map();
    this.ObsoleteNodes = new Map();
  }

  /**
   *
   * Singleton object keeps only one instance
   * @static
   * @returns {Region} Instance of Region
   * @memberof Region
   */
  public static getInstance(): Region {
    if (!Region.instance) {
      Region.instance = new Region();
    }
    return Region.instance;
  }

  /**
   * Number of regions
   *
   * @readonly
   * @type {number}
   * @memberof Region
   */
  public get RegionCount(): number {
    return this.Regions.size;
  }

  /**
   * Updates the newest region with the given nodes.
   * This is only used for the first region.
   * Following regions are updated inside of `PredictiveForest`
   *
   * @param {Array<NTNode>} nodes Nodes to be added to the newest region
   * @memberof Region
   */
  public Update(nodes: Array<NTNode>): void {
    const newRegion: Map<number, RegionalNode> = new Map();
    nodes.forEach((node) => {
      const rNode = new RegionalNode(node, new Set());
      newRegion.set(rNode.NodeID, rNode);
    });
    this.Regions.set(this.RegionCount, newRegion);
  }
}
