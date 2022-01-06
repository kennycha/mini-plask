import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { GLTF2Export, IExportOptions } from "@babylonjs/serializers/glTF";
import styled from "styled-components";
import {
  createCamera,
  createDirectionalLight,
  createHemisphericLight,
  getRandomStringKey,
  getSplittedFileName,
} from "./utils";
import { Asset, Motion, MotionDatum } from "./types";
import Dropdown from "./components/Dropdown";

const DEFAULT_SKELETON_VIEWER_OPTION = {
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
};

const DEFAULT_FPS = 1;
const DEFAULT_SPEED = 1;
const DEFAULT_FROM = 0;
const DEFAULT_TO = 10;

const App = () => {
  const renderingCanvas = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<BABYLON.Scene>();
  // prettier-ignore
  const [skeletonViewer, setSkeletonViewer] = useState<BABYLON.SkeletonViewer>();
  const [currentAsset, setCurrentAsset] = useState<Asset>();
  const [currentMotion, setCurrentMotion] = useState<Motion | null>();
  // prettier-ignore
  const [currentAnimationGroup, setCurrentAnimationGroup] = useState<BABYLON.AnimationGroup>();
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [motionList, setMotionList] = useState<Motion[]>([]);

  useEffect(() => {
    const handleSceneReady = (scene: BABYLON.Scene) => {
      scene.useRightHandedSystem = true;
      scene.clearColor = BABYLON.Color4.FromColor3(
        BABYLON.Color3.FromHexString("#202020")
      );
      const arcRotateCamera = createCamera(scene);
      const hemisphericLight = createHemisphericLight(scene);
      const directionalLight = createDirectionalLight(scene);

      // const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }); // dummy mesh
    };

    if (renderingCanvas.current) {
      BABYLON.Animation.AllowMatricesInterpolation = true;
      const engine = new BABYLON.Engine(renderingCanvas.current, true);
      const innerScene = new BABYLON.Scene(engine);

      innerScene.onReadyObservable.addOnce((scene) => {
        handleSceneReady(scene);
        setScene(scene);
      });
      innerScene.onDisposeObservable.addOnce(() => {
        window.location.reload();
      });

      engine.runRenderLoop(() => {
        innerScene.render();
      });

      return () => {
        engine.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (scene && currentAsset && currentMotion) {
      const newAnimationGroup = new BABYLON.AnimationGroup(currentMotion.name);
      currentMotion.motionData.forEach((motionDatum) => {
        let animation: BABYLON.Animation;
        if (motionDatum.property === "rotationQuaternion") {
          animation = new BABYLON.Animation(
            motionDatum.name,
            motionDatum.property,
            DEFAULT_FPS,
            BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
          );
        } else {
          animation = new BABYLON.Animation(
            motionDatum.name,
            motionDatum.property,
            DEFAULT_FPS,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
          );
        }
        animation.setKeys(motionDatum.transformKeys);

        newAnimationGroup.addTargetedAnimation(animation, motionDatum.target);
      });

      newAnimationGroup.normalize(DEFAULT_FROM, DEFAULT_TO);
      setCurrentAnimationGroup(newAnimationGroup);

      return () => {
        newAnimationGroup.stop().dispose();
      };
    }
  }, [scene, currentMotion, currentAsset]);

  const handleImportInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const targetFile = event.target.files?.[0];
      if (targetFile && scene) {
        const [fileName, fileExtension] = getSplittedFileName(targetFile.name);
        if (fileExtension === "glb") {
          try {
            const loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(
              "file:",
              targetFile,
              scene
            );

            const {
              meshes,
              geometries,
              skeletons,
              transformNodes,
              animationGroups,
            } = loadedAssetContainer;

            const assetId = getRandomStringKey();
            const newAsset: Asset = {
              id: assetId,
              name: fileName,
              extension: fileExtension,
              meshes,
              geometries,
              skeleton: skeletons[0],
              bones: skeletons[0].bones,
              transformNodes: transformNodes,
            };

            const newMotions: Motion[] = [];
            animationGroups.forEach((animationGroup, idx) => {
              animationGroup.stop();

              const motionData: MotionDatum[] = [];
              animationGroup.targetedAnimations.forEach(
                ({ target, animation }) => {
                  motionData.push({
                    name: animation.name,
                    target,
                    property: animation.targetProperty,
                    transformKeys: [...animation.getKeys()],
                  });
                }
              );

              newMotions.push({
                id: getRandomStringKey(),
                name: animationGroup.name,
                assetId: assetId,
                motionData,
              });
            });

            setAssetList((prev) => [...prev, newAsset]);
            setMotionList((prev) => [...prev, ...newMotions]);
          } catch (error) {
            console.error(error);
          }
        } else if (fileExtension === "fbx") {
        }
      }
    },
    [scene]
  );

  const handleVisualizeButtonClick = useCallback(() => {
    if (scene && currentAsset) {
      const {
        id: assetId,
        meshes,
        geometries,
        skeleton,
        bones,
        transformNodes,
      } = currentAsset;

      if (skeletonViewer) {
        skeletonViewer.dispose();
      }

      scene.meshes.forEach((mesh) => {
        mesh.getChildMeshes().forEach((childMesh) => {
          scene.removeMesh(childMesh);
        });
        scene.removeMesh(mesh);
      });

      scene.geometries.forEach((geometry) => {
        scene.removeGeometry(geometry);
      });

      scene.skeletons.forEach((skeleton) => {
        scene.removeSkeleton(skeleton);
      });

      scene.transformNodes.forEach((transformNode) => {
        scene.removeTransformNode(transformNode);
      });

      meshes.forEach((mesh) => {
        scene.addMesh(mesh);
      });

      geometries.forEach((geometry) => {
        scene.addGeometry(geometry);
      });

      scene.addSkeleton(skeleton);

      transformNodes.forEach((transformNode) => {
        scene.addTransformNode(transformNode);
      });

      const innerSkeletonViewer = new BABYLON.SkeletonViewer(
        skeleton,
        meshes[0],
        scene,
        true,
        meshes[0].renderingGroupId,
        DEFAULT_SKELETON_VIEWER_OPTION
      );
      setSkeletonViewer(innerSkeletonViewer);
    }
  }, [currentAsset, scene, skeletonViewer]);

  const handleExportGlbButtonClick = useCallback(() => {
    const options: IExportOptions = {
      shouldExportNode: (node: BABYLON.Node) => {
        return (
          !node.name.includes("joint") &&
          !node.name.includes("ground") &&
          !node.name.includes("scene")
        );
      },
      // metadataSelector: (metadata: any) => {
      //   return metadata;
      // },
      // animationSampleRate: 30,
      // exportWithoutWaitingForScene: false,
      // exportUnusedUVs: false,
      // includeCoordinateSystemConversionNodes: false,
    };

    if (scene && currentAsset && currentMotion) {
      if (skeletonViewer) {
        skeletonViewer.isEnabled = false;
      }

      scene.animationGroups.forEach((animationGroup) => {
        scene.removeAnimationGroup(animationGroup);
      });

      const newAnimationGroup = new BABYLON.AnimationGroup(currentMotion.name);
      currentMotion.motionData.forEach((motionDatum) => {
        let animation: BABYLON.Animation;
        if (motionDatum.property === "rotationQuaternion") {
          animation = new BABYLON.Animation(
            motionDatum.name,
            motionDatum.property,
            DEFAULT_FPS,
            BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
          );
        } else {
          animation = new BABYLON.Animation(
            motionDatum.name,
            motionDatum.property,
            DEFAULT_FPS,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
          );
        }
        animation.setKeys(motionDatum.transformKeys);

        newAnimationGroup.addTargetedAnimation(animation, motionDatum.target);
      });

      GLTF2Export.GLBAsync(scene, currentAsset.name, options).then((glb) => {
        glb.downloadFiles();
      });

      if (skeletonViewer) {
        skeletonViewer.isEnabled = true;
      }
    }
  }, [scene, currentAsset, skeletonViewer, currentMotion]);

  const handlePlayButtonClick = useCallback(() => {
    if (currentAnimationGroup && !currentAnimationGroup.isPlaying) {
      if (currentAnimationGroup.isStarted) {
        currentAnimationGroup.play(true);
      } else {
        currentAnimationGroup.start(
          true,
          DEFAULT_SPEED,
          DEFAULT_FROM,
          DEFAULT_TO
        );
      }
    }
  }, [currentAnimationGroup]);

  const handlePauseButtonClick = useCallback(() => {
    if (currentAnimationGroup && currentAnimationGroup.isPlaying) {
      currentAnimationGroup.pause();
    }
  }, [currentAnimationGroup]);

  const handleStopButtonClick = useCallback(() => {
    if (currentAnimationGroup && currentAnimationGroup.isStarted) {
      currentAnimationGroup.goToFrame(DEFAULT_FROM).stop();
    }
  }, [currentAnimationGroup]);

  const assetOptions = useMemo(() => {
    return assetList.map((asset) => ({
      value: asset.name,
      onSelect: () => {
        setCurrentAsset(asset);
      },
    }));
  }, [assetList, setCurrentAsset]);

  const motionOptions = useMemo(() => {
    return motionList
      .filter((motion) => motion.assetId === currentAsset?.id)
      .map((filteredMotion) => ({
        value: filteredMotion.name,
        onSelect: () => setCurrentMotion(filteredMotion),
      }));
  }, [motionList, currentAsset, setCurrentMotion]);

  return (
    <Container>
      <header className="button-wrapper">
        <input
          className="import-input"
          type="file"
          accept=".glb, .fbx"
          onChange={handleImportInputChange}
        />
        <Dropdown options={assetOptions} />
        <Dropdown options={motionOptions} />
        <button onClick={handleVisualizeButtonClick}>visualize</button>
        <button onClick={handlePlayButtonClick}>play</button>
        <button onClick={handlePauseButtonClick}>pause</button>
        <button onClick={handleStopButtonClick}>stop</button>
        <button onClick={handleExportGlbButtonClick}>export glb</button>
      </header>
      <main>
        <canvas ref={renderingCanvas} id="renderingCanvas" />
      </main>
      <footer>by kennyCha @Plask</footer>
    </Container>
  );
};

export default App;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;

  .button-wrapper {
    display: flex;
    justify-content: start;
    align-items: center;
    width: 100%;
    height: 22px;

    input {
      width: 200px;
      height: 100%;
    }

    button {
      width: 120px;
      height: 100%;
      border: 0px;
      cursor: pointer;
    }
  }

  main {
    width: 100%;
    height: calc(100vh - 22px);
    border: 1px dotted black;

    #renderingCanvas {
      width: 100%;
      height: 100%;
    }
  }

  footer {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 20px;
    width: 100%;
    color: white;
    pointer-events: none;
  }
`;
