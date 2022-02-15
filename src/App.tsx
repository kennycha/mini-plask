import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { isUndefined } from "lodash";

import * as Plask from './plask3d'
import Dropdown from "./components/Dropdown";
import { getSplittedFileName } from "./utils";

const App = () => {
  const renderingCanvas = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<Plask.PlaskScene>();
  const [modelList, setModelList] = useState<(Plask.PlaskModel | Plask.PlaskHumanModel)[]>([])
  const [motionList, setMotionList] = useState<Plask.PlaskMotion[]>([])
  const [currentModelId, setCurrentModelId] = useState<string>();
  const [currentMotionId, setCurrentMotionId] = useState<string>()
  
  useEffect(() => {
    if (renderingCanvas.current) {
      const engine = new Plask.PlaskEngine(renderingCanvas.current)
      const innerScene = new Plask.PlaskScene(engine)
      setScene(innerScene)
    }
  }, []);

  const handleImportInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const targetFile = event.target.files?.[0];
      if (targetFile && scene) {
        const extension = getSplittedFileName(targetFile.name)[1]
        if (extension === "glb") {
          await scene.loadGlbFile(targetFile)
          setModelList(scene.getModels())
          setMotionList(scene.getMotions())
        } else if (extension === "fbx") {
        }
      }
    },
    [scene]
  );

  const handleVisualizeButtonClick = useCallback(() => {
    if (scene && !isUndefined(currentModelId)) {
      const model = scene.getModelById(currentModelId)
      if (model) {
        scene.clearModels()
        model.visualize()
      }
    }
  }, [currentModelId, scene])
  
  const modelOptions = useMemo(() => {
    return modelList.map((model) => ({
      value: model.getName(),
      onSelect: () => {
        setCurrentModelId(model.getId())
      }
    }))
  }, [modelList])

  const motionOptions = useMemo(() => {
    if (currentModelId) {
      return motionList.filter((m) => m.getModelId() === currentModelId).map((motion) => ({
        value: motion.getName(),
        onSelect: () => {
          setCurrentMotionId(motion.getId())
        }
      }))
    } else {
      return []
    }
  }, [currentModelId, motionList])

  return (
    <Container>
      <header className="button-wrapper">
        <input
          className="import-input"
          type="file"
          accept=".glb, .fbx"
          onChange={handleImportInputChange}
        />
        <Dropdown options={modelOptions} />
        <Dropdown options={motionOptions} />
        <button onClick={handleVisualizeButtonClick}>visualize</button>
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
