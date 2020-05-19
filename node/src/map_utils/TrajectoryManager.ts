/* eslint-disable @typescript-eslint/no-explicit-any */
import * as L from 'leaflet';
import { CustomMarker } from '../props';

export class TrajectoryManager {
    mMap: L.Map;
    mUpdatePoints: Array < L.LatLng > ;
    mTrajectory: Array < Array<number> > ;

    mLayers: Array<L.Layer>;

    constructor(mMap: L.Map) {
        this.mMap = mMap;
        this.mUpdatePoints = [];
        this.mLayers = [];
        this.addListeners();
        this.mTrajectory = [];
    }


    private async addTrajectory(coord: L.LatLng): Promise<void> {
        this.mMap.closePopup();
        this.mUpdatePoints.push(coord);
        // console.log('-----------------------------------');
        // console.log(this.mTrajectory);
        // console.log(this.mUpdatePoints);
        const prevRegion = (this.mUpdatePoints.length > 1) ? this.mTrajectory[this.mUpdatePoints.length - 2] : [];

        // console.log(prevRegion);
        // console.log('-----------------------------------');

        const response = await fetch('http://localhost:5000/connectedNodes', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                lat: coord.lat,
                lng: coord.lng,
                dist: this.getDist(),
                predictiveStep: this.getNumPredictiveSteps(),
                update: this.mUpdatePoints.length,
                prevRegion: prevRegion
            })
        }).catch((err) => {
            console.log('Something went wrong grabbing connected nodes');
            console.log(err);
        }) as Response;

        const data = await response.json().catch((err) => {
            console.log('Something went wrong parsing json');
            console.log(err);
        }); // expect connected nodes, lat long, and edges(polygon) from py server
        this.logAndDrawRegion(coord, data);
    }
    private logAndDrawRegion(center: L.LatLng, data: any): void {
        const circle = L.circle(center, {
            color: '#957DAD',
            opacity: 0.4,
            fillColor: '#957DAD',
            fillOpacity: 0.2,
            radius: parseInt(this.getDist())
        }).addTo(this.mMap);
        this.mLayers.push(circle);
        console.log(data);

        const subTrajectory: number[] = [];
        for (const [key, value] of Object.entries(data['keptNodes'])) {
            const sourceNode = (value as any)[key];
            for (const [nodeID, destinationNode] of Object.entries(value as any)) {
                if (!subTrajectory.includes(parseInt(nodeID))) {
                    this.addPointMarker(nodeID, destinationNode);
                    subTrajectory.push(parseInt(nodeID));
                    if (nodeID === sourceNode['id']) {
                        continue;
                    } else {
                        this.addEdgeMarker(sourceNode, destinationNode);
                    }
                }
            }
        }
        data['deleted_nodes'].forEach((element: any) => {
            this.mLayers.forEach((layer: L.Layer) => {
                if (typeof(layer as CustomMarker).customID !== 'undefined') {
                    if (parseInt(element) === (layer as CustomMarker).customID) {
                        layer.removeFrom(this.mMap);
                        (layer as CustomMarker).options.color = 'red';
                        layer.addTo(this.mMap);
                    }
                }
            });
        });
        this.mTrajectory.push(subTrajectory);
    }
    private addEdgeMarker(source: any, destination: any): void {
        const polyline = new L.Polyline([source, destination], {
            color: '#00A7EA'
        }).addTo(this.mMap);
        this.mLayers.push(polyline);
    }

    private addPointMarker(nodeID: string, node: any): void {
        const marker = new CustomMarker(new L.LatLng(node['lat'], node['lng']), {
            fillColor: '#E58E35',
            fillOpacity: 1,
            stroke: false,
            opacity: 1
        }, parseInt(nodeID)).addTo(this.mMap);
        this.mLayers.push(marker);
    }

    private getNumPredictiveSteps(): string {
        return (document.getElementById('predictiveSteps') as HTMLInputElement).value;
    }

    private getDist(): string {
        return (document.getElementById('regionSize') as HTMLInputElement).value;
    }

    private addListeners(): void {
        // trajectory reset
        document.getElementById('reset_trajectory')?.addEventListener('click', () => {
            this.mLayers.map(x => x.removeFrom(this.mMap));
            this.mUpdatePoints = [];
            this.mLayers = [];
            this.mTrajectory = [];
        });

        // node addition confirmation
        this.mMap.addEventListener('click', e => {
            const coord = (e as L.LeafletMouseEvent).latlng;
            const popup = new L.Popup({
                    closeButton: true
                }
            )
            .setLatLng(coord)
            .openOn(this.mMap);
            const label = `Lat: ${coord.lat}<br>` +
                        `Long: ${coord.lng}<br>` +
                        'Add to trajectory? <br>';
            popup.setContent(this.addTrajectoryButton(label, coord));
        });
    }

    private addTrajectoryButton(labelString: string, coord: L.LatLng): HTMLElement {
        const container = L.DomUtil.create('div');
        const label = L.DomUtil.create('span', '', container);
        label.innerHTML = labelString;
        const btn = L.DomUtil.create('button', '', container);
        btn.innerHTML = 'Add';
        btn.addEventListener('click', () => {
            this.addTrajectory(coord);
        });
        return container;
    }

}