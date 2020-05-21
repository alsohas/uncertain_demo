import * as L from 'leaflet';
import { TrajectoryManager, } from './TrajectoryManager';

export function getNumPredictiveSteps(): string {
  return (document.getElementById('predictiveSteps') as HTMLInputElement).value;
}

export function getDist(): string {
  return (document.getElementById('regionSize') as HTMLInputElement).value;
}

export function nThPredictionChecked(): boolean {
  return (document.getElementById('nthStepPrediction') as HTMLInputElement).checked;
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
    if (nThPredictionChecked()) {
      const predictiveElement = document.getElementById('predictiveSteps') as HTMLInputElement;
      const steps = predictiveElement.value;
      predictiveElement.value = (parseInt(steps) - 1).toString();
    }
  });
  return container;
}

export function updateNodesPruned(numNode: number): void {
  const label = document.getElementById('nodesPruned') as HTMLElement;
  label.innerHTML = numNode.toString();
}

export function updatePresentProbability(numNode: number): void {
  const label = document.getElementById('presentProbability') as HTMLElement;
  label.innerHTML = numNode.toFixed(2);
}

export function updatePredictiveProbability(numNode: number): void {
  const label = document.getElementById('predictiveProbability') as HTMLElement;
  label.innerHTML = numNode.toFixed(2);
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

  document.getElementById('predictiveSteps')?.addEventListener('change', () => {
    const steps = (document.getElementById('predictiveSteps') as HTMLInputElement).value;
    let suffix!: string;
    if (parseInt(steps) === 1) {
      suffix = 'st';
    } else if (parseInt(steps) === 2) {
      suffix = 'nd';
    } else if (parseInt(steps) === 3) {
      suffix = 'rd';
    } else {
      suffix = 'th';
    }
    (document.getElementById('nthStepPredictionLabel') as HTMLLabelElement).textContent = `Predict ${steps}${suffix} Step`;
  });
}
