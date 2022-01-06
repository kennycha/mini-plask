import * as BABYLON from "@babylonjs/core";

const defaultReflectionDirection = new BABYLON.Vector3(0, 1, 1);

const createHemisphericLight = (
  scene: BABYLON.Scene,
  reflectionDirection?: BABYLON.Vector3
) => {
  const hemisphericLight = new BABYLON.HemisphericLight(
    "hemisphericLight",
    (reflectionDirection = defaultReflectionDirection),
    scene
  );
  hemisphericLight.intensity = 0.9;

  return hemisphericLight;
};

export default createHemisphericLight;
