import * as BABYLON from '@babylonjs/core'

import { getRandomStringKey } from '../utils';

interface MotionDatum {
  name: string;
  target: BABYLON.TransformNode;
  property: string;
  transformKeys: BABYLON.IAnimationKey[];
}

class PlaskMotion {
  private _id: string;
  private _name: string;
  private _modelId: string;
  private _data: MotionDatum[];

  constructor(modelId: string, motionName: string, targetedAnimations: BABYLON.TargetedAnimation[]) {
    this._id = getRandomStringKey()
    this._name = motionName
    this._modelId = modelId
    this._data = []
    targetedAnimations.forEach(({ target, animation }) => {
      this._data.push({
        name: animation.name,
        target,
        property: animation.targetProperty,
        transformKeys: animation.getKeys()
      })
    })
  }

  public getId() {
    return this._id
  }

  public getName() {
    return this._name
  }

  public getClassName() {
    return 'PlaskMotion'
  }

  public getModelId() {
    return this._modelId
  }
}

export default PlaskMotion