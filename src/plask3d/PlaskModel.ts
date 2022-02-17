import * as BABYLON from '@babylonjs/core'
import { Extension } from "../types";
import { getRandomStringKey, getSplittedFileName } from '../utils';
import PlaskMotion from './PlaskMotion';
import PlaskScene from './PlaskScene';

class PlaskModel {
  private _id: string;
  private _name: string;
  private _extension: Extension;
  private _rootMesh: BABYLON.AbstractMesh;
  private _meshes: BABYLON.AbstractMesh[];
  private _geometries: BABYLON.Geometry[];
  private _motions: PlaskMotion[];
  private _scene: PlaskScene;

  constructor(fileName: string, assetContainer: BABYLON.AssetContainer, scene: PlaskScene) {
    this._id = getRandomStringKey()
    const [name, extension] = getSplittedFileName(fileName)
    this._name = name
    this._extension = extension as Extension
    this._rootMesh = assetContainer.meshes[0]
    this._meshes = assetContainer.meshes
    this._geometries = assetContainer.geometries
    this._motions = assetContainer.animationGroups.map((animationGroup => {
      animationGroup.stop()
      return this.createMotionWithAnimationGroup(animationGroup)
    }))
    this._scene = scene
  }

  private createMotionWithAnimationGroup(animationGroup: BABYLON.AnimationGroup) {
    return new PlaskMotion(this.getId(), animationGroup.name, animationGroup.targetedAnimations)
  }
  
  public getId() {
    return this._id
  }

  public getName() {
    return this._name
  }

  public getClassName() {
    return 'PlaskModel'
  }

  public getScene() {
    return this._scene
  }

  public getAssets() {
    return {
      rootMesh: this._rootMesh,
      meshes: this._meshes,
      geometries: this._geometries,
    }
  }

  public getMotions() {
    return this._motions
  }

  public visualize() {
    const scene = this.getScene()
    scene.visualizeModel(this)
  }
}

export default PlaskModel