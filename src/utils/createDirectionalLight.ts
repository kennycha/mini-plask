import * as BABYLON from "@babylonjs/core";

const defaultPosition = new BABYLON.Vector3(0, 10, 10);
const defaultDirection = new BABYLON.Vector3(0, 1, 0);

const createDirectionalLight = (
  scene: BABYLON.Scene,
  position?: BABYLON.Vector3,
  direction?: BABYLON.Vector3
) => {
  const directionalLight = new BABYLON.DirectionalLight(
    "directionalLight",
    (direction = defaultDirection),
    scene
  );
  directionalLight.position = position ?? defaultPosition;
  directionalLight.intensity = 0.1;

  return directionalLight;
};

export default createDirectionalLight;
