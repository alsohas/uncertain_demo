import { RegionalNode, } from './RegionalNode';
import { NTNode, } from '../util/ntnode';

export class Region {
  private static instance: Region;

  public Regions: Map<number, Map<number, RegionalNode>>;
  public ObsoleteNodes: Set<number>;

  private constructor() {
    this.Regions = new Map();
    this.ObsoleteNodes = new Set();
  }

  public static getInstance(): Region {
    if (!Region.instance) {
      Region.instance = new Region();
    }
    return Region.instance;
  }

  public get RegionCount(): number {
    return this.Regions.size;
  }


  public Update(nodes: Array<NTNode>): void {
    const newRegion: Map<number, RegionalNode> = new Map();
    nodes.forEach((node) => {
      const rNode = new RegionalNode(node, new Set());
      newRegion.set(rNode.NodeID, rNode);
    });
    this.Regions.set(this.RegionCount, newRegion);
  }
}
