import {ambientLight, dirLight} from './light';
import {camera, cameraWidth, cameraHeight} from './camera';
import {getRoad} from './road';
import {Car} from './car';
import {move} from './controller';
import {
  nZones,
  FRAME_TIME,
  ANIMATION_TIME,
  LANE_1,
  LANE_2,
  LANE_3,
  LANE_4,
  CAR_LENGTH,
  CAR_WIDTH,
  FPS,
} from './constants';
import IntersectionSimulation from './intersection-management/intersection-simulation';

const IS = new IntersectionSimulation(4);
document.getElementById('randCars').onclick = (e) => IS.randomCars();
document.getElementById('randSol').onclick = (e) => IS.pickRandomSolution();
document.getElementById('checkCycle').onclick = (e) =>
  console.log(IS.isCycleExist(true));
document.getElementById('reset').onclick = (e) => IS.reset();
document.getElementById('showOnlyZones').onclick = (e) => IS.showOnlyZones();
document.getElementById('showFull').onclick = (e) => IS.showFull();
document.getElementById('stepNext').onclick = (e) => IS.stepNext();
document.getElementById('stepPrev').onclick = (e) => IS.stepPrev();

// The Pythagorean theorem says that the distance between two points is
// the square root of the sum of the horizontal and vertical distance's square
function getDistance(coordinate1, coordinate2) {
  const horizontalDistance = coordinate2.x - coordinate1.x;
  const verticalDistance = coordinate2.y - coordinate1.y;
  return Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
}

const config = {
  showHitZones: false,
  shadows: false, // Use shadow
  trees: false, // Add trees to the map
  curbs: false, // Show texture on the extruded geometry
  grid: false, // Show grid helper
};

let ready;
let lastTimestamp;

const scene = new THREE.Scene();

// scene.add(getRoad(cameraWidth, cameraHeight * 2, nZones)); // Original Code: The map height is higher because we look at the map from an angle
// scene.add(getRoad(cameraHeight * 2, cameraHeight * 2, nZones)); // set height == width
scene.add(
  getRoad(
    document.getElementById('intersection').offsetHeight * 2,
    document.getElementById('intersection').offsetHeight * 2,
    nZones,
  ),
); // set height == width
scene.add(ambientLight);
scene.add(dirLight);

const carsConfig = [
  {
    zones: [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 1, y: 0},
      {x: 1, y: 1},
    ],
    position: {
      // TODO: should be more responsive to handle nZones changes
      // x: -window.intersectionArea.width / nZones - CAR_LENGTH / 2,
      x: -window.intersectionArea.width / nZones,
      y: -window.intersectionArea.height / nZones / 2,
    },
    onLane: LANE_1,
  },
  {
    zones: [
      {x: 1, y: 1},
      {x: 1, y: 1},
      {x: 1, y: 1},
      {x: 0, y: 1},
      {x: 0, y: 1},
    ],
    position: {
      // TODO: should be more responsive to handle nZones changes
      x: window.intersectionArea.width / nZones,
      y: window.intersectionArea.height / nZones / 2,
    },
    onLane: LANE_2,
  },
  // {
  //   zones: [
  //     {x: 1, y: 0},
  //     {x: 1, y: 0},
  //     {x: 1, y: 1},
  //     {x: 0, y: 1},
  //   ],
  //   position: {
  //     // TODO: should be more responsive to handle nZones changes
  //     x: window.intersectionArea.width / nZones / 2,
  //     y: -window.intersectionArea.height / nZones - CAR_LENGTH / 2,
  //   },
  //   onLane: LANE_4,
  // },
  {
    zones: [
      {x: 0, y: 1},
      {x: 0, y: 1},
      {x: 0, y: 0},
      {x: 0, y: 0},
      {x: 1, y: 0},
    ],
    position: {
      // TODO: should be more responsive to handle nZones changes
      x: -window.intersectionArea.width / nZones / 2,
      y: window.intersectionArea.height / nZones,
    },
    onLane: LANE_3,
  },
];

const addCar = (scene, config) => {
  const car = Car(config);
  scene.add(car);
  return car;
};

const cars = carsConfig.map((config) => {
  const car = addCar(scene, config);
  return car;
});

// if (config.grid) {
//   const gridHelper = new THREE.GridHelper(80, 8);
//   gridHelper.rotation.x = Math.PI / 2;
//   scene.add(gridHelper);
// }

// Set up renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(
  document.getElementById('intersection').offsetWidth,
  document.getElementById('intersection').offsetWidth,
);
if (config.shadows) renderer.shadowMap.enabled = true;
document.getElementById('intersection').appendChild(renderer.domElement);

reset();

function reset() {
  lastTimestamp = undefined;

  // Render the scene
  renderer.render(scene, camera);
  ready = true;
}

startGame();

function startGame() {
  if (ready) {
    ready = false;
    // renderer.setAnimationLoop(animation);
  }
}

// let startTimestamp = 0;
// let resumeTimestamp = 0;
// let pauseTimestamp = 0;
// let resume = false;

let animationInterval = null;
let counter = 0;
let numOfFrame = 0;
const TIME_DELTA = 1000 / FPS;

document.getElementById('next').addEventListener('click', () => {
  animationInterval = setInterval(_animation, TIME_DELTA);
});
function _animation() {
  counter += TIME_DELTA;
  if (counter > FRAME_TIME) {
    counter = 0;
    numOfFrame++;
    clearInterval(animationInterval);
  } else {
    document.getElementById('step').innerHTML = `Step: ${numOfFrame + 1}`;
    cars.forEach((car) => {
      move(car, numOfFrame, TIME_DELTA);
    });
    renderer.render(scene, camera);
  }
}

/*
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

  cars.forEach((car) => {
    move(car, timestamp, timeDelta);
  });

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
*/

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
