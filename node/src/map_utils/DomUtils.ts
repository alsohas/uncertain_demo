import * as L from 'leaflet';
import { TrajectoryManager, } from './TrajectoryManager';

export function getNumPredictiveSteps(): string {
  return (document.getElementById('predictiveSteps') as HTMLInputElement).value;
}

export function getDist(): string {
  return (document.getElementById('regionSize') as HTMLInputElement).value;
}

export function addTrajectoryButton(
  mMap: L.Map,
  labelString: string,
  coord: L.LatLng
): HTMLElement {
  const container = L.DomUtil.create('div');
  const label = L.DomUtil.create('span', '', container);
  label.innerHTML = labelString;
  const btn = L.DomUtil.create('button', '', container);
  btn.innerHTML = 'Add';
  btn.addEventListener('click', () => {
    TrajectoryManager.getInstance(mMap).addTrajectory(coord);
  });
  return container;
}

export function addListeners(mMap: L.Map): void {
  const tManager = TrajectoryManager.getInstance(mMap);
  document.getElementById('reset_trajectory')?.addEventListener('click', () => {
    tManager.reset();
  });

  mMap.addEventListener('click', (e) => {
    const coord = (e as L.LeafletMouseEvent).latlng;
    const popup = new L.Popup({
      closeButton: true,
    })
      .setLatLng(coord)
      .openOn(mMap);
    const label =
      `Lat: ${coord.lat}<br>` +
      `Long: ${coord.lng}<br>` +
      'Add to trajectory? <br>';
    popup.setContent(addTrajectoryButton(mMap, label, coord));
  });
}
