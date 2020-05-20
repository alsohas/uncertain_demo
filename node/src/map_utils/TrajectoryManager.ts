/* eslint-disable @typescript-eslint/no-explicit-any */
import * as L from 'leaflet';
import { LayerManger, } from './LayerManager';
import { PredictiveForest, } from '../Forest/core/PredictiveForest';

export class TrajectoryManager {
  public mMap: L.Map;
  mUpdatePoints: Array<L.LatLng>;
  mTrajectory: Array<Array<number>>;

  mLayerManager: LayerManger;

  private static instance: TrajectoryManager;
  forest: PredictiveForest;

  private constructor(mMap: L.Map) {
    this.mMap = mMap;
    this.mUpdatePoints = [];
    this.mTrajectory = [];
    this.mLayerManager = LayerManger.getInstance(this.mMap);
    this.forest = new PredictiveForest(this.mMap);
  }

  public static getInstance(mMap: L.Map): TrajectoryManager {
    if (!TrajectoryManager.instance) {
      TrajectoryManager.instance = new TrajectoryManager(mMap);
    }
    return TrajectoryManager.instance;
  }

  public async addTrajectory(coord: L.LatLng): Promise<void> {
    this.mMap.closePopup();
    this.mUpdatePoints.push(coord);
    this.forest.Update(coord);
  }

  public reset(): void {
    location.reload();
  }
}
