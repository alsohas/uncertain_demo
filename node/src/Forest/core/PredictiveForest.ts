import { RoadNetwork, } from '../util/roadnetwork';
import { Region, } from './Region';
import * as L from 'leaflet';
import { getNumPredictiveSteps, } from '../../map_utils/DomUtils';
import { LayerManger, } from '../../map_utils/LayerManager';
import { intersect, union, } from '../util/setops';
import { RegionalNode, } from './RegionalNode';
import { PredictiveNode, } from './PredictiveNode';
import { NTNode, } from '../util/ntnode';

export class PredictiveForest {
  RoadNetwork: RoadNetwork;
  Region: Region;
  CurrentStep = 0;
  mMap: L.Map;
  PredictiveRegions!: Map<number, Map<number, Array<PredictiveNode>>>;
  ValidEdgeMarkers: Map<Array<number>, L.Polyline>;
  PredictiveEdgeMarkers: Array<L.Polyline> = [];

  constructor(mMap: L.Map) {
    this.mMap = mMap;
    this.RoadNetwork = RoadNetwork.getInstance();
    this.Region = Region.getInstance();
    this.ValidEdgeMarkers = new Map();
    (document.getElementById('showPredictive') as HTMLElement).addEventListener('click', (e) => {
      if (((e.target) as HTMLInputElement).checked) {
        // this.PredictiveEdgeMarkers.map
        return;
      }
    });
  }

  public get Depth(): number {
    return parseInt(getNumPredictiveSteps());
  }


  public async Update(center: L.LatLng): Promise<void> {
    if (this.CurrentStep === 0) {
      const nodeIDs = await RoadNetwork.getNodesWithinRange(center);
      const nodes = nodeIDs.map((n) =>
        this.RoadNetwork.Nodes.get(n)
      ) as NTNode[];
      this.Region.Update(nodes);
      const region = this.Region.Regions.get(this.CurrentStep) as Map<
        number,
        RegionalNode
      >;
      this.ExpandPredictiveTrees(region);
      await this.drawRegion(nodeIDs, center);
      this.CurrentStep++;
      return;
    }
    const pastNodes = this.Region.Regions.get(this.CurrentStep - 1) as Map<
      number,
      RegionalNode
    >;

    let children = new Set<number>();
    pastNodes.forEach((rNode) => {
      children = union(children, rNode.Children);
    });
    let currentNodes = new Set<number>();
    (await RoadNetwork.getNodesWithinRange(center)).forEach((nodeID) => {
      currentNodes.add(nodeID);
    });
    currentNodes = intersect(currentNodes, children);

    const obsoleteParents = new Set<number>();
    const validParents = new Set<number>();

    pastNodes.forEach((pastNode) => {
      pastNode.Children = intersect(pastNode.Children, currentNodes);
      if (pastNode.Children.size === 0) {
        obsoleteParents.add(pastNode.NodeID);
      } else {
        validParents.add(pastNode.NodeID);
      }
    });

    const newRegion: Map<number, RegionalNode> = new Map();
    currentNodes.forEach((nodeID) => {
      const node = this.RoadNetwork.Nodes.get(nodeID);
      if (node) {
        const currentNode = new RegionalNode(node, validParents);
        newRegion.set(nodeID, currentNode);
      }
    });
    this.Region.Regions.set(this.CurrentStep, newRegion);

    await this.PruneRegions(this.CurrentStep - 1, obsoleteParents);
    this.drawRegion(currentNodes, center);
    this.markObsoletes();
    this.ExpandPredictiveTrees(newRegion);
    this.drawEdges();
    this.CurrentStep++;
  }
  private markObsoletes(): void {
    LayerManger.getInstance(this.mMap).markObsoleteNodes(
      this.Region.ObsoleteNodes
    );
    this.ValidEdgeMarkers.forEach((polyLine, idArray) => {
      if (
        this.Region.ObsoleteNodes.has(idArray[0]) ||
        this.Region.ObsoleteNodes.has(idArray[1])
      ) {
        polyLine.setStyle({
          color: 'red',
          fillColor: 'red',
        });
      }
    });
  }

  private drawEdges(): void {
    const currentRegion = this.Region.Regions.get(this.CurrentStep) as Map<
      number,
      RegionalNode
    >;
    currentRegion.forEach((regionalNode) => {
      regionalNode.Parents.forEach((parentID) => {
        const sourceNode = this.RoadNetwork.Nodes.get(parentID) as NTNode;
        const destinationNode = regionalNode.Node as NTNode;
        const edgeMarker = LayerManger.getInstance(this.mMap).addEdgeMarker(
          sourceNode?.Location,
          destinationNode.Location
        );
        this.ValidEdgeMarkers.set(
          [parentID, destinationNode.NodeID,],
          edgeMarker
        );
      });
    });
  }

  private async ExpandPredictiveTrees(
    newRegion: Map<number, RegionalNode>
  ): Promise<void> {
    this.PredictiveEdgeMarkers.map((marker) => marker.removeFrom(this.mMap));
    this.PredictiveEdgeMarkers = [];
    this.PredictiveRegions = new Map();
    newRegion.forEach((node) => {
      if (this.Region.ObsoleteNodes.has(node.NodeID)) {
        return;
      }
      const predictiveNode = new PredictiveNode(
        node.Node,
        this.Depth,
        this.Depth,
        this.PredictiveRegions,
        this.PredictiveEdgeMarkers,
        this.mMap
      );
      predictiveNode.Expand();
    });
  }

  private async PruneRegions(
    steps: number,
    obsoleteNodes: Set<number>
  ): Promise<void> {
    this.Region.ObsoleteNodes = union(this.Region.ObsoleteNodes, obsoleteNodes);
    if (obsoleteNodes.size === 0) {
      return;
    }
    const obsoleteParents = new Set<number>();
    const region = this.Region.Regions.get(steps);
    const parentalRegion = this.Region.Regions.get(steps - 1);
    if (!parentalRegion || !region) {
      return;
    }
    obsoleteNodes.forEach((nodeID) => {
      const node = region?.get(nodeID);
      region.delete(nodeID);
      const parents = node?.Parents;
      if (!parents) {
        return;
      }
      parents.forEach((pNodeID) => {
        const parent = parentalRegion.get(pNodeID);
        parent?.Children.delete(nodeID);
        if (parent?.Children.size === 0) {
          obsoleteParents.add(pNodeID);
        }
      });
    });
    this.PruneRegions(steps - 1, obsoleteParents);
  }

  private async drawRegion(
    nodes: Set<number> | Array<number>,
    center: L.LatLng
  ): Promise<void> {
    nodes.forEach((nodeID: number) => {
      const node = this.RoadNetwork.Nodes.get(nodeID);
      if (node) {
        LayerManger.getInstance(this.mMap).addPointMarker(node);
      }
    });
    LayerManger.getInstance(this.mMap).addNewRegion(center);
  }
}
