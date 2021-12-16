import {ambientLight, dirLight} from './light';
import {camera, cameraWidth, cameraHeight} from './camera';
import {getRoad} from './road';
import {Car} from './car';
import {move} from './controller';
import {nZones, FRAME_TIME, ANIMATION_TIME} from './constants';

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

// scene.add(getRoad(cameraWidth, cameraHeight * 2, nZones)); // Original Code: The map height is higher because we look at the map from an angle
scene.add(getRoad(cameraHeight * 2, cameraHeight * 2, nZones)); // set height == width
scene.add(ambientLight);
scene.add(dirLight);

const playerCar = Car(config);
scene.add(playerCar);
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

startGame();
function startGame() {
  if (ready) {
    ready = false;
    renderer.setAnimationLoop(animation);
  }
}

let startTimestamp = 0;
let resumeTimestamp = 0;
let pauseTimestamp = 0;
let pause = false;
let resume = false;

function animation(originalTimestamp) {
  const timestamp = pauseTimestamp + originalTimestamp - resumeTimestamp;

  if (resume) {
    resumeTimestamp = originalTimestamp;
    resume = false;
    return;
  }

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

  // TODO: need refactor
  document.getElementById('stop').addEventListener('click', () => {
    pauseTimestamp = timestamp;
    renderer.setAnimationLoop(null);
  });
  document.getElementById('resume').addEventListener('click', () => {
    resume = true;
    renderer.setAnimationLoop(animation);
  });
}

/*
// Another Animation System
// https://blog.csdn.net/ithanmang/article/details/84062933
// https://stackoverflow.com/questions/40434314/threejs-animationclip-example-needed

// POSITION
playerCar.name = 'playerCar';
const positionKF = new THREE.KeyframeTrack(
  'playerCar.position',
  [0, 2],
  [0, 0, 0, 100, 100, 0],
);

// ROTATION
// set up rotation about x axis
const zAxis = new THREE.Vector3(0, 0, 1);

var qInitial = new THREE.Quaternion().setFromAxisAngle(zAxis, 0);
var qFinal = new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI / 2);
var quaternionKF = new THREE.QuaternionKeyframeTrack(
  '.quaternion',
  [0, 1],
  [
    qInitial.x,
    qInitial.y,
    qInitial.z,
    qInitial.w,
    qFinal.x,
    qFinal.y,
    qFinal.z,
    qFinal.w,
  ],
);

// create an animation sequence with the tracks
// If a negative time value is passed, the duration will be calculated from the times of the passed tracks array
const clip = new THREE.AnimationClip('action', 2, [positionKF, quaternionKF]);

// setup the AnimationMixer
const mixer = new THREE.AnimationMixer(playerCar);

// create a ClipAction and set it to play
const clipAction = mixer.clipAction(clip);
clipAction.setLoop(THREE.LoopOnce).play();

const clock = new THREE.Clock();
const _animate = () => {
  requestAnimationFrame(_animate);
  renderer.render(scene, camera);
  mixer.update(clock.getDelta());
};
_animate();
*/
