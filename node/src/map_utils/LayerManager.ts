/* eslint-disable @typescript-eslint/no-explicit-any */
import * as L from 'leaflet';
import { getDist, } from './DomUtils';
import { CustomMarker, } from '../props';
import { NTNode, } from '../Forest/util/ntnode';

export class LayerManger {
  mMap: L.Map;
  allLayers: Array<L.Layer>;
  regionMarkers: Array<L.Circle>;
  deletedNodes: Set<number>;
  private static instance: LayerManger;
  pointMarker: any;

  private constructor(mMap: L.Map) {
    this.mMap = mMap;
    this.allLayers = [];
    this.regionMarkers = [];
    this.deletedNodes = new Set();
    this.pointMarker = {};
  }

  public static getInstance(mMap: L.Map): LayerManger {
    if (!LayerManger.instance) {
      LayerManger.instance = new LayerManger(mMap);
    }

    return LayerManger.instance;
  }

  public async addNewRegion(center: L.LatLng): Promise<void> {
    const circle = L.circle(center, {
      color: '#957DAD',
      opacity: 0.7,
      fillColor: '#957DAD',
      fillOpacity: 0.1,
      radius: parseInt(getDist()),
    }).addTo(this.mMap);
    this.regionMarkers.push(circle);
    this.allLayers.push(circle);
  }

  public addEdgeMarker(source: L.LatLng, destination: L.LatLng): L.Polyline {
    const polyline = new L.Polyline([source, destination,], {
      // color: '#77dd77',
      color: 'green',
      weight: 8,
      opacity: 0.5,
    }).addTo(this.mMap);
    this.allLayers.push(polyline);
    return polyline;
  }

  public addPredictiveEdgeMarker(source: L.LatLng, destination: L.LatLng): L.Polyline {
    const polyline = new L.Polyline([source, destination,], {
      // color: '#00A7EA',
      color: 'blue',
      weight: 8,
      opacity: 0.3,
    });
    if ((document.getElementById('showPredictive') as HTMLInputElement).checked) {
      polyline.addTo(this.mMap);
    }
    this.allLayers.push(polyline);
    return polyline;
  }

  public async addPointMarker(node: NTNode): Promise<void> {
    const marker = new CustomMarker(node.Location, node.NodeID, {
      fillColor: '#77dd77',
      fillOpacity: 1,
      stroke: false,
      opacity: 1,
      weight: 5,
    }).addTo(this.mMap);
    this.allLayers.push(marker);
    this.pointMarker[node.NodeID] = marker;
  }

  public reset(): void {
    this.allLayers.map((x) => x.removeFrom(this.mMap));
    this.regionMarkers = [];
    this.allLayers = [];
    this.pointMarker = {};
  }

  public async markObsoleteNodes(nodes: Set<number>, obsoleteMarker: Array<L.Layer>): Promise<void> {
    nodes.forEach((nodeID) => {
      this.allLayers.forEach((layer: L.Layer) => {
        if (typeof (layer as CustomMarker).nodeID !== 'undefined') {
          if (nodeID === (layer as CustomMarker).nodeID) {
            (layer as CustomMarker).setStyle({
              fillColor: 'red',
              // color: '#E58E35',
              color: 'red',
              opacity: 0.3,
              weight: 8,
            });
            obsoleteMarker.push(layer);
          }
        }
      });
    });
  }
}
