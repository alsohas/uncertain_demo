import { RoadNetwork, } from '../util/roadnetwork';
import { Region, } from './Region';
import * as L from 'leaflet';
import { getNumPredictiveSteps, } from '../../map_utils/DomUtils';
import { LayerManger, } from '../../map_utils/LayerManager';
import { intersect, union, difference, } from '../util/setops';
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
  ObsoleteMarkers: Array<L.Polyline> = [];


  /**
   * Creates an instance of PredictiveForest.
   * @param {L.Map} `Leaflet.Map` object to be hooked into for GUI manipulation
   * @memberof PredictiveForest
   */
  constructor(mMap: L.Map) {
    this.mMap = mMap;
    this.RoadNetwork = RoadNetwork.getInstance();
    this.Region = Region.getInstance();
    this.ValidEdgeMarkers = new Map();
    (document.getElementById('showPredictive') as HTMLElement).addEventListener(
      'click',
      (e) => {
        if ((e.target as HTMLInputElement).checked) {
          this.PredictiveEdgeMarkers.map((e) => e.addTo(mMap));
        } else {
          this.PredictiveEdgeMarkers.map((e) => e.removeFrom(mMap));
        }
      }
    );
    (document.getElementById('showObsolete') as HTMLElement).addEventListener(
      'click',
      (e) => {
        if ((e.target as HTMLInputElement).checked) {
          this.ObsoleteMarkers.map((e) => e.addTo(mMap));
        } else {
          this.ObsoleteMarkers.map((e) => e.removeFrom(mMap));
        }
      }
    );
  }

  /**
   *
   * Computed value retrieves the depth of predictive trees from user input
   * @readonly
   * @type {number}
   * @memberof PredictiveForest
   */
  public get Depth(): number {
    return parseInt(getNumPredictiveSteps());
  }


  /**
   *
   * Updates the predictive forest by building a new region around the given center
   * @param {L.LatLng} center Central point of new region
   * @returns {Promise<void>} void
   * @memberof PredictiveForest
   */
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


  /**
   * Marks all obsolete nodes on the map
   *
   * @private
   * @memberof PredictiveForest
   */
  private markObsoletes(): void {
    const globalObsoletes = this.getGlobalObsoletes();
    LayerManger.getInstance(this.mMap).markObsoleteNodes(
      globalObsoletes,
      this.ObsoleteMarkers
    );
    this.ValidEdgeMarkers.forEach((polyLine, idArray) => {
      if (globalObsoletes.has(idArray[0]) || globalObsoletes.has(idArray[1])) {
        polyLine.setStyle({
          // color: '#E58E35',
          // fillColor: '#E58E35',
          color: 'red',
          fillColor: 'red',
          opacity: 0.5,
          weight: 8,
        });
        this.ObsoleteMarkers.push(polyLine);
      }
    });
  }


  /**
   * Retrieves nodes that have no references to any existing region
   *
   * @private
   * @returns {Set<number>} Globally obsolete nodes
   * @memberof PredictiveForest
   */
  private getGlobalObsoletes(): Set<number> {
    let globalObsoletes = new Set<number>();
    this.Region.ObsoleteNodes.forEach((obsoleteNodes) => {
      globalObsoletes = union(globalObsoletes, obsoleteNodes);
    });
    console.log(globalObsoletes);
    let globalValids = new Set<number>();
    this.Region.Regions.forEach((region) => {
      const nodeIDs = new Set(region.keys());
      globalValids = union(globalValids, nodeIDs);
    });
    globalObsoletes = difference(globalObsoletes, globalValids);
    return globalObsoletes;
  }


  /**
   * Draws polylines representing edges
   *
   * @private
   * @memberof PredictiveForest
   */
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


  /**
   * Starts the expansion of predictive trees from the latest region
   *
   * @private
   * @param {Map<number, RegionalNode>} newRegion Nodes within a region
   * @returns {Promise<void>} void
   * @memberof PredictiveForest
   */
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


  /**
   *
   * Prunes a given region based on the step provided
   * @private
   * @param {number} steps Determines pruned region level
   * @param {Set<number>} obsoleteNodes The nodes to be pruned
   * @returns {Promise<void>} void
   * @memberof PredictiveForest
   */
  private async PruneRegions(
    steps: number,
    obsoleteNodes: Set<number>
  ): Promise<void> {
    if (obsoleteNodes.size === 0) {
      return;
    }
    const _obsoletesNodes = this.Region.ObsoleteNodes.get(steps);
    if (_obsoletesNodes) {
      this.Region.ObsoleteNodes.set(
        steps,
        union(_obsoletesNodes, obsoleteNodes)
      );
    } else {
      this.Region.ObsoleteNodes.set(steps, obsoleteNodes);
    }

    const obsoleteParents = new Set<number>();
    const region = this.Region.Regions.get(steps);
    const parentalRegion = this.Region.Regions.get(steps - 1);
    if (!region) {
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
        const parent = parentalRegion?.get(pNodeID);
        parent?.Children.delete(nodeID);
        if (parent?.Children.size === 0) {
          obsoleteParents.add(pNodeID);
        }
      });
    });

    this.PruneRegions(steps - 1, obsoleteParents);
  }


  /**
   * Draws the region as a circle around the center and accompanying nodes
   *
   * @private
   * @param {(Set<number> | Array<number>)} nodes Nodes to mark on map
   * @param {L.LatLng} center Region center
   * @returns {Promise<void>}
   * @memberof PredictiveForest
   */
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
