import * as L from 'leaflet';

export class TrajectoryManager {
    mMap: L.Map;
    mTrajectory: Array < L.LatLng > ;

    constructor(mMap: L.Map) {
        this.mMap = mMap;
        this.mTrajectory = new Array < L.LatLng > ();
        this.addListeners();
    }

    private addListeners(): void {
        // trajectory reset
        document.getElementById('reset_trajectory')?.addEventListener('click', () => {
            this.mTrajectory.length = 0;
            console.log(this.mTrajectory);
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
        console.log(coord);
        btn.addEventListener('click', () => {
            this.addTrajectory(coord);
        });
        return container;
    }

    private async addTrajectory(coord: L.LatLng): Promise<void> {
        this.mMap.closePopup();
        this.mTrajectory.push(coord);
        console.log(this.mTrajectory);

        const response = await fetch('http://localhost:5000/connectedNodes', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                lat: coord.lat,
                lng: coord.lng,
                dist: this.getDist()
            })
        }).catch((err) => {
            console.log('Something went wrong grabbing connected nodes');
            console.log(err);
        }) as Response;

        const data = await response.json().catch((err) => {
            console.log('Something went wrong parsing json');
            console.log(err);
        }); // expect connected nodes, lat long, and edges(polygon) from py server
        console.log(data);
    }
    private getDist(): string {
        console.log((document.getElementById('regionSize') as HTMLInputElement).value);
        return (document.getElementById('regionSize') as HTMLInputElement).value;
    }
}