import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

const setupOrbitControls = (camera, renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI / 3;
  controls.minPolarAngle = 0;
  controls.maxZoom = 3;
  controls.minZoom = 0.6;
  return controls;
};

export {setupOrbitControls};
