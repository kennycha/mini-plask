import * as BABYLON from '@babylonjs/core'
import PlaskModel from "./PlaskModel";
import PlaskScene from './PlaskScene';

class PlaskHumanModel extends PlaskModel {
  private _skeleton: BABYLON.Skeleton;
  private _bones: BABYLON.Bone[];
  private _transformNodes: BABYLON.TransformNode[];
  private _skeletonViewer: BABYLON.SkeletonViewer | null;
  
  constructor(fileName: string, assetContainer: BABYLON.AssetContainer, scene: PlaskScene) {
    super(fileName, assetContainer, scene)

    this._skeleton = assetContainer.skeletons[0]
    this._bones = this._skeleton.bones
    this._transformNodes = assetContainer.transformNodes
    this._skeletonViewer = null
  }

  public createSkeletonViewer(skeleton: BABYLON.Skeleton, rootMesh: BABYLON.AbstractMesh, scene: BABYLON.Scene) {
    const options = {
      pauseAnimations: false,
      returnToRest: false,
      computeBonesUsingShaders: true,
      useAllBones: true, // error with false
      displayMode: BABYLON.SkeletonViewer.DISPLAY_SPHERE_AND_SPURS,
      displayOptions: {
        sphereBaseSize: 0.01,
        sphereScaleUnit: 15,
        sphereFactor: 0.9,
        midStep: 0.25,
        midStepFactor: 0.05,
      },
    }
    
    this._skeletonViewer = new BABYLON.SkeletonViewer(skeleton, rootMesh, scene, true, rootMesh.renderingGroupId, options)
  }

  public getClassName() {
    return 'PlaskHumanModel'
  }

  public getAssets() {
    return {
      ...super.getAssets(),
      skeleton: this._skeleton,
      skeletonViewer: this._skeletonViewer,
      transformNodes: this._transformNodes,
    }
  }

  public visualize() {
    const scene = this.getScene()
    scene.visualizeHumanModel(this)
  }

}

export default PlaskHumanModel