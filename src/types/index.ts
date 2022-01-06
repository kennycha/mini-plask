import * as BABYLON from "@babylonjs/core";

export type Extension = "glb" | "fbx";

export interface Asset {
  id: string;
  name: string;
  extension: Extension;
  meshes: BABYLON.AbstractMesh[];
  geometries: BABYLON.Geometry[];
  skeleton: BABYLON.Skeleton;
  bones: BABYLON.Bone[];
  transformNodes: BABYLON.TransformNode[];
}

export interface MotionDatum {
  name: string;
  target: BABYLON.TransformNode;
  property: string;
  transformKeys: BABYLON.IAnimationKey[];
}

export interface Motion {
  id: string;
  name: string;
  assetId: string;
  motionData: MotionDatum[];
}

export interface Option {
  value: string;
  onSelect: any;
}
