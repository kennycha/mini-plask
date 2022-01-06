import * as BABYLON from "@babylonjs/core";

const DEFAULT_CAMERA_POSITION_ARRAY = [0, 6, 10];

const createCamera = (
  scene: BABYLON.Scene,
  initialPosition?: BABYLON.Vector3
) => {
  const arcRotateCamera = new BABYLON.ArcRotateCamera(
    "arcRotateCamera",
    0,
    6,
    10,
    BABYLON.Vector3.Zero(),
    scene
  );
  arcRotateCamera.setPosition(
    (initialPosition = BABYLON.Vector3.FromArray(DEFAULT_CAMERA_POSITION_ARRAY))
  );
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

  return arcRotateCamera;
};

export default createCamera;
