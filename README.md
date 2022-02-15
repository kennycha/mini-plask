# Mini Plask

> React, Babylon, TypeScript, Styled-Components

- Base Project for Understanding Plask and Babylon

- You Can

  1. Import and export .glb files.
  2. Visualize model.
  3. Debug with SkeletonViewer.
  4. ~~Control animations.~~

- Data Structures

  - The project has similar data structure to the Plask app.
  - Asset has meshes, geometries, skeleton, bones and transformNodes, which can be rendered on the canvas.
  - Motion has assetId and motionData, which can be used to make animationGroup to control.
  - MotionData are similar to tracks of Plask, which have transformKeys consist of frame and value.

- How to Use

  1. Fork this repository.
  2. Understand the Plask app by comparing with this project.
  3. And add any functions you want.
  4. Recommend to add functions in the real Plask app.

     (like attaching gizmo, editing keyframes, customizing camera, and so on.)

  5. Make PR for this repository if you want my review or comments.

- Updates (Feb 15th, 2022)

  1. Created an inner module for Babylon.js for abstraction purpose.
