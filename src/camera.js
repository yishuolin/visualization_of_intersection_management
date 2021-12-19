// const aspectRatio = window.innerWidth / window.innerHeight;
const aspectRatio =
  document.getElementById('intersection').offsetWidth /
  document.getElementById('intersection').offsetHeight;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.OrthographicCamera(
  cameraWidth / -2, // left
  cameraWidth / 2, // right
  cameraHeight / 2, // top
  cameraHeight / -2, // bottom
  50, // near plane
  700, // far plane
);

camera.position.set(0, -21, 300);
camera.lookAt(0, 0, 0);

export {camera, cameraWidth, cameraHeight};
