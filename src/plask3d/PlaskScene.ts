import * as BABYLON from '@babylonjs/core';
import PlaskEngine from "./PlaskEngine";
import PlaskHumanModel from './PlaskHumanModel';
import PlaskModel from './PlaskModel';
import PlaskMotion from './PlaskMotion';

class PlaskScene {
  _engine: PlaskEngine;
  _scene: BABYLON.Scene;
  _cameras: BABYLON.ArcRotateCamera[];
  _lights: (BABYLON.DirectionalLight | BABYLON.HemisphericLight)[];
  _models: (PlaskModel | PlaskHumanModel)[];
  _motions: PlaskMotion[];
  _visualizedModels: (PlaskModel | PlaskHumanModel)[];

  constructor(engine: PlaskEngine) {
    this._engine = engine
    this._scene = this.createScene(engine)
    this._cameras = []
    this._lights = []
    this._models = []
    this._motions = []
    this._visualizedModels = []
  }

  public getEngine() {
    return this._engine
  }

  public getBabylonScene() {
    return this._scene
  }

  public getModels() {
    return this._models
  }

  public getModelById(id: string) {
    return this._models.find((model) => model.getId() === id)
  }

  public getMotions() {
    return this._motions
  }

  public getMotionById(id: string) {
    return this._motions.find((motion) => motion.getId() === id)
  }

    
  private createScene(engine: PlaskEngine) {
    const handleSceneReady = (scene: BABYLON.Scene) => {
      scene.useRightHandedSystem = true;
      scene.clearColor = BABYLON.Color4.FromColor3(
        BABYLON.Color3.FromHexString("#202020")
      );
      
      this.addArcRotateCamera(scene)
      this.addHemisphericLight(scene)
      this.addDirectionalLight(scene)
    }

    const scene = new BABYLON.Scene(engine.getBabylonEngine())
    
    scene.onReadyObservable.addOnce((scene) => {
      handleSceneReady(scene)
    })
    
    scene.onDisposeObservable.addOnce(() => {
      window.location.reload()
    })

    engine.getBabylonEngine().runRenderLoop(() => {
      scene.render()
    })

    return scene
  }

  public addArcRotateCamera(scene: BABYLON.Scene, position?: BABYLON.Vector3) {
    const arcRotateCamera = new BABYLON.ArcRotateCamera('arcRotateCamera', 0, 6, 10, BABYLON.Vector3.Zero(), scene)
    arcRotateCamera.setPosition(position ?? new BABYLON.Vector3(0, 6, 10))
    arcRotateCamera.attachControl(scene.getEngine().getRenderingCanvas(), false);
    arcRotateCamera.allowUpsideDown = false;
    arcRotateCamera.minZ = 0.1;
    arcRotateCamera.inertia = 0.5;
    arcRotateCamera.wheelPrecision = 50;
    arcRotateCamera.wheelDeltaPercentage = 0.05;
    arcRotateCamera.lowerRadiusLimit = 0.1;
    arcRotateCamera.upperRadiusLimit = 20;
    arcRotateCamera.pinchPrecision = 50;
    arcRotateCamera.panningAxis = new BABYLON.Vector3(1, 1, 0);
    arcRotateCamera.panningInertia = 0.5;
    arcRotateCamera.panningDistanceLimit = 20;

    this._cameras = [...this._cameras, arcRotateCamera]
  }

  public addDirectionalLight(scene: BABYLON.Scene, position?: BABYLON.Vector3, direction?: BABYLON.Vector3) {
    const directionalLight = new BABYLON.DirectionalLight('directionalLight', direction ?? new BABYLON.Vector3(0, 1, 0), scene)
    directionalLight.position = position ?? new BABYLON.Vector3(0, 10, 10)
    directionalLight.intensity = 0.1

    this._lights = [...this._lights, directionalLight]
  }

  public addHemisphericLight(scene: BABYLON.Scene, reflectionDirection?: BABYLON.Vector3) {
    const hemisphericLight = new BABYLON.HemisphericLight('hemisphericLight', reflectionDirection ?? new BABYLON.Vector3(0, 1, 1), scene)
    hemisphericLight.intensity = 0.9

    this._lights = [...this._lights, hemisphericLight]
  }

  public async loadGlbFile(file: File) {
    try {
      const loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync('file:', file, this.getBabylonScene())
      const { skeletons } = loadedAssetContainer
      
      if (skeletons.length > 0 && skeletons[0].bones.length > 0) {
        const model = new PlaskHumanModel(file.name, loadedAssetContainer, this)
        this._models = [...this._models, model]
        this._motions =  [...this._motions, ...model.getMotions()]
      } else {
        const model = new PlaskModel(file.name, loadedAssetContainer, this)
        this._models = [...this._models, model]
        this._motions =  [...this._motions, ...model.getMotions()]
      }

    } catch (error) {
      console.error(error)
    }
  }

  public clearModels() {
    this._visualizedModels.forEach((model) => {
      if (model.getClassName() === 'PlaskModel') {
        this.unvisualizeModel(model)
      } else if (model.getClassName() === 'PlaskHumanModel') {
        this.unvisualizeHumanModel(model as PlaskHumanModel)
      }
    })
  }

  public visualizeHumanModel(model: PlaskHumanModel) {
    const babylonScene = this.getBabylonScene()
    const { rootMesh, meshes, geometries, skeleton, transformNodes } = model.getAssets()
    
    meshes.forEach((mesh) => {
      babylonScene.addMesh(mesh)
    })
    geometries.forEach((geometry) => {
      babylonScene.addGeometry(geometry)
    })
    babylonScene.addSkeleton(skeleton)
    transformNodes.forEach((transformNode) => {
      babylonScene.addTransformNode(transformNode)
    })
    model.createSkeletonViewer(skeleton, rootMesh, babylonScene)
    
    this._visualizedModels = [...this._visualizedModels, model]
  }

  public unvisualizeHumanModel(model :PlaskHumanModel) {
    const babylonScene = this.getBabylonScene()
    const { meshes, geometries, skeleton, transformNodes, skeletonViewer } = model.getAssets()

    if (skeletonViewer) {
      skeletonViewer.dispose()
    }

    meshes.forEach((mesh) => {
      babylonScene.removeMesh(mesh)
    })
    geometries.forEach((geometry) => {
      babylonScene.removeGeometry(geometry)
    })
    babylonScene.removeSkeleton(skeleton)
    transformNodes.forEach((transformNode) => {
      babylonScene.removeTransformNode(transformNode)
    })

    this._visualizedModels = this._visualizedModels.filter((m) => m.getId() !== model.getId())
  }
  
  public visualizeModel(model: PlaskModel) {
    const babylonScene = this.getBabylonScene()
    const { meshes, geometries } = model.getAssets()
    meshes.forEach((mesh) => {
      babylonScene.addMesh(mesh)
    })
    geometries.forEach((geometry) => {
      babylonScene.addGeometry(geometry)
    })

    this._visualizedModels = [...this._visualizedModels, model]
  }

  public unvisualizeModel(model: PlaskModel) {
    const babylonScene = this.getBabylonScene()
    const { meshes, geometries } = model.getAssets()
    meshes.forEach((mesh) => {
      babylonScene.removeMesh(mesh)
    })
    geometries.forEach((geometry) => {
      babylonScene.removeGeometry(geometry)
    })

    this._visualizedModels = this._visualizedModels.filter((m) => m.getId() !== model.getId())
  }
}

export default PlaskScene