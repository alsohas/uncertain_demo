import * as L from 'leaflet';

export class CustomMarker extends L.CircleMarker {
  nodeID: number;
  constructor(
    latLng: L.LatLng,
    nodeID: number,
    options?: L.CircleMarkerOptions
  ) {
    super(latLng, options);
    this.nodeID = nodeID;
  }
}
