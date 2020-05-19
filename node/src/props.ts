import * as L from 'leaflet';

export class CustomMarker extends L.CircleMarker {
    customID: number | undefined;
    constructor(latLng: L.LatLng, options?: L.CircleMarkerOptions, customID?: number) {
        super(latLng, options);
        this.customID = customID;
    }
}