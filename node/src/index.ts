import * as L from 'leaflet';

function addTileLayer(mMap: L.Map): void {
    // L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    //     maxZoom: 20,
    //     attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    // }).addTo(myMap);

    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
        id: 'dark-v10',
        accessToken: 'pk.eyJ1IjoiYWlzbGFtOTYiLCJhIjoiY2thYTFrMXA3MHo4MjJycXJndmxkMnJxaCJ9.vBNXhQiLauBvBKIckaZAEA'
    }).addTo(mMap);
}

function coordinateLogger(e: L.LeafletMouseEvent): void {
    console.log(e.latlng);
}

function init(): void {
    const mMap = L.map('map').setView([47.608013, -122.335167], 16);
    mMap.addEventListener('click', e => coordinateLogger(e as L.LeafletMouseEvent));
    addTileLayer(mMap);
}

init();