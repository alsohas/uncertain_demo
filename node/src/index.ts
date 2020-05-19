import * as L from 'leaflet';
import {
    TrajectoryManager
} from './map_utils/TrajectoryManager';

function addTileLayer(mMap: L.Map): void {
    // L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    //     maxZoom: 20,
    //     attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    // }).addTo(mMap);

    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
        tileSize: 512,
        zoomOffset: -1,
        id: 'streets-v10',
        accessToken: 'pk.eyJ1IjoiYWlzbGFtOTYiLCJhIjoiY2thYTFrMXA3MHo4MjJycXJndmxkMnJxaCJ9.vBNXhQiLauBvBKIckaZAEA'
    }).addTo(mMap);
}

function init(): void {
    const mMap = L.map('map').setView([47.608013, -122.335167], 16);
    addTileLayer(mMap);
    new TrajectoryManager(mMap);
}

init();