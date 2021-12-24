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

camera.position.set(0, -150, 300);
camera.lookAt(0, 0, 0);
camera.up = new THREE.Vector3(0,0,1);

export {camera, cameraWidth, cameraHeight};
