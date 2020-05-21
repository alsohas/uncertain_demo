import * as L from 'leaflet';
import { TrajectoryManager, } from './map_utils/TrajectoryManager';
import { addListeners, updateNodesPruned, } from './map_utils/DomUtils';
import { RoadNetwork, } from './Forest/util/roadnetwork';

function addBoundingBox(mMap: L.Map): void {
  const minLong = -122.4198709;
  const minLat = 47.5006937;
  const maxLong = -122.1879224;
  const maxLat = 47.7019488;

  const topLeft = new L.LatLng(maxLat, minLong);
  const topRight = new L.LatLng(maxLat, maxLong);
  const bottomRight = new L.LatLng(minLat, maxLong);
  const bottomLeft = new L.LatLng(minLat, minLong);

  new L.Polyline([topLeft, topRight,]).addTo(mMap);
  new L.Polyline([topLeft, bottomLeft,]).addTo(mMap);
  new L.Polyline([topRight, bottomRight,]).addTo(mMap);
  new L.Polyline([bottomRight, bottomLeft,]).addTo(mMap);
}

function addTileLayer(mMap: L.Map): void {
  L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      tileSize: 512,
      zoomOffset: -1,
      id: 'streets-v10',
      accessToken:
        'pk.eyJ1IjoiYWlzbGFtOTYiLCJhIjoiY2thYTFrMXA3MHo4MjJycXJndmxkMnJxaCJ9.vBNXhQiLauBvBKIckaZAEA',
    }
  ).addTo(mMap);
  addBoundingBox(mMap);
}

function init(): void {
  const mMap = L.map('map').setView([47.608013, -122.335167,], 16);
  addTileLayer(mMap);
  const r = RoadNetwork.getInstance();
  r.Build();
  TrajectoryManager.getInstance(mMap);
  addListeners(mMap);
}

init();