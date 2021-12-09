import {ambientLight, dirLight} from './light';
import {camera, cameraWidth, cameraHeight} from './camera';
import {getRoad} from './road';
import {Car} from './car';
import {move} from './controller';
import {nZones, FRAME_TIME, ANIMATION_TIME} from './constants';
window.focus(); // Capture keys right away (by default focus is on editor)

// The Pythagorean theorem says that the distance between two points is
// the square root of the sum of the horizontal and vertical distance's square
function getDistance(coordinate1, coordinate2) {
  const horizontalDistance = coordinate2.x - coordinate1.x;
  const verticalDistance = coordinate2.y - coordinate1.y;
  return Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
}

const config = {
  showHitZones: false,
  shadows: true, // Use shadow
  trees: true, // Add trees to the map
  curbs: true, // Show texture on the extruded geometry
  grid: false, // Show grid helper
};

let otherVehicles = [];
let ready;
let lastTimestamp;

const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

const arcAngle1 = (1 / 3) * Math.PI; // 60 degrees

const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

const arcCenterX =
  (Math.cos(arcAngle1) * innerTrackRadius +
    Math.cos(arcAngle2) * outerTrackRadius) /
  2;

const scene = new THREE.Scene();

const playerCar = Car(config);
scene.add(playerCar);

// scene.add(getRoad(cameraWidth, cameraHeight * 2, nZones)); // Original: The map height is higher because we look at the map from an angle
scene.add(getRoad(cameraHeight * 2, cameraHeight * 2, nZones)); // set height == width
scene.add(ambientLight);
scene.add(dirLight);
// const cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(cameraHelper);

if (config.grid) {
  const gridHelper = new THREE.GridHelper(80, 8);
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);
}

// Set up renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
if (config.shadows) renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

reset();

function reset() {
  // Reset position and score
  // playerAngleMoved = 0;

  // Remove other vehicles
  otherVehicles.forEach((vehicle) => {
    // Remove the vehicle from the scene
    scene.remove(vehicle.mesh);

    // If it has hit-zone helpers then remove them as well
    if (vehicle.mesh.userData.hitZone1)
      scene.remove(vehicle.mesh.userData.hitZone1);
    if (vehicle.mesh.userData.hitZone2)
      scene.remove(vehicle.mesh.userData.hitZone2);
    if (vehicle.mesh.userData.hitZone3)
      scene.remove(vehicle.mesh.userData.hitZone3);
  });
  otherVehicles = [];

  lastTimestamp = undefined;

  // Place the player's car to the starting position
  // movePlayerCar(0);

  // Render the scene
  renderer.render(scene, camera);

  ready = true;
}
playerCar.position.x = playerCar.currentPosition.x;
playerCar.position.y = playerCar.currentPosition.y;
startGame();
function startGame() {
  if (ready) {
    ready = false;
    renderer.setAnimationLoop(animation);
  }
}

let startTimestamp = 0;
function animation(timestamp) {
  // init lastTimestamp
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    return;
  }
  // end of game
  if (startTimestamp >= ANIMATION_TIME) {
    return;
  }
  // end of one frame
  if (timestamp - startTimestamp >= FRAME_TIME) {
    startTimestamp = timestamp;
    return;
  }
  const timeDelta = timestamp - lastTimestamp;
  move(playerCar, timestamp, timeDelta);

  renderer.render(scene, camera);
  lastTimestamp = timestamp;
}
