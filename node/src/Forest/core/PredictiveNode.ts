import { NTNode, } from '../util/ntnode';
import { Region, } from './Region';
import { LayerManger, } from '../../map_utils/LayerManager';

export class PredictiveNode {
  Parent: NTNode | undefined;
  Root: NTNode;
  Depth: number;
  MaxDepth: number;
  Level: number;
  PredictiveRegions: Map<number, Map<number, Array<PredictiveNode>>>;
  Children: Map<number, PredictiveNode>;
  PredictiveEdgeMarkers: Array<L.Polyline>;
  mMap: L.Map;

  constructor(
    root: NTNode,
    depth: number,
    maxDepth: number,
    predictiveRegions: Map<number, Map<number, Array<PredictiveNode>>>,
    predictiveEdgeMarkers: Array<L.Polyline>,
    mMap: L.Map,
    parent?: NTNode
  ) {
    if (parent) {
      this.Parent = parent;
    }
    this.Root = root;
    this.Depth = depth;
    this.MaxDepth = maxDepth;
    this.Level = this.MaxDepth - this.Depth;
    this.PredictiveRegions = predictiveRegions;
    this.PredictiveEdgeMarkers = predictiveEdgeMarkers;
    this.mMap = mMap;
    this.Children = new Map();
    this.AddRegionalReference();
  }

  private AddRegionalReference(): void {
    let region = this.PredictiveRegions.get(this.Level);
    if (!region) {
      region = new Map();
      this.PredictiveRegions.set(this.Level, region);
    }
    let nodeList = region.get(this.Root.NodeID);
    if (!nodeList) {
      nodeList = [];
      region.set(this.Root.NodeID, nodeList);
    }
    nodeList.push(this);
  }

  public async Expand(): Promise<void> {
    if (this.Depth === 0 || this.MaxDepth == this.Level) {
      return;
    }
    this.Root.OutgoingEdges.forEach(async (edge, node) => {
      if (Region.getInstance().ObsoleteNodes.has(node.NodeID)) {
        return;
      }
      if (this.Parent && this.Parent.NodeID == node.NodeID) {
        return;
      }
      if (
        Region.getInstance()
          .Regions.get(Region.getInstance().RegionCount - 2)
          ?.has(node.NodeID)
      ) {
        return;
      }
      const child = new PredictiveNode(
        node,
        this.Depth - 1,
        this.MaxDepth,
        this.PredictiveRegions,
        this.PredictiveEdgeMarkers,
        this.mMap,
        this.Root
      );
      this.Children.set(child.Root.NodeID, child);
      child.Expand();
      const edgeMarker = LayerManger.getInstance(
        this.mMap
      ).addPredictiveEdgeMarker(this.Root.Location, child.Root.Location);
      this.PredictiveEdgeMarkers.push(edgeMarker);
    });
  }
}
