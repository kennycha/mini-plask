import * as BABYLON from '@babylonjs/core'

class PlaskEngine {
  private _engine: BABYLON.Engine;

  constructor(canvas: HTMLCanvasElement) {
    BABYLON.Animation.AllowMatricesInterpolation = true;
    this._engine = this.createEngine(canvas)
  }

  private createEngine(canvas: HTMLCanvasElement) {
    return new BABYLON.Engine(canvas, true);
  }

  public getBabylonEngine() {
    return this._engine
  }

  public dispose() {
    this._engine.dispose()
  }
}

export default PlaskEngine