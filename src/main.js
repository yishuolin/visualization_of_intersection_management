import {ambientLight, dirLight} from './light';
import {camera, cameraWidth, cameraHeight} from './camera';
import {getRoad} from './road';
import {Car} from './car';
import {move} from './controller';
import {Stack} from './helpers';
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
  TURN_LEFT,
  TURN_RIGHT,
  GO_STRAIGHT,
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

const Intersection = document.getElementById('intersection');

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

const scene = new THREE.Scene();

// scene.add(getRoad(cameraWidth, cameraHeight * 2, nZones)); // Original Code: The map height is higher because we look at the map from an angle
scene.add(
  getRoad(Intersection.offsetHeight * 2, Intersection.offsetHeight * 2, nZones),
);

scene.add(ambientLight);
scene.add(dirLight);

const carsConfig = [
  {
    carId: 0,
    position: {
      // TODO: should be dynamic
      x: -window.intersectionArea.width / nZones - CAR_LENGTH, // TODO: 3 should be a constant
      y: -window.intersectionArea.height / nZones / 2,
    },
    onLane: LANE_1,
    trajectory: TURN_LEFT,
    stage: 1,
  },
  {
    carId: 1,
    position: {
      x: window.intersectionArea.width / nZones + CAR_LENGTH,
      y: window.intersectionArea.height / nZones / 2,
    },
    onLane: LANE_2,
    trajectory: TURN_LEFT,
    stage: 1,
  },
  {
    carId: 2,
    position: {
      x: window.intersectionArea.width / nZones / 2,
      y: -window.intersectionArea.height / nZones - CAR_LENGTH,
    },
    onLane: LANE_4,
    trajectory: GO_STRAIGHT,
    stage: 1,
  },
  {
    carId: 3,
    position: {
      x: -window.intersectionArea.width / nZones / 2,
      y: window.intersectionArea.height / nZones + CAR_LENGTH,
    },
    onLane: LANE_3,
    trajectory: TURN_RIGHT,
    stage: 1,
  },
  {
    carId: 4,
    position: {
      x: -window.intersectionArea.width / nZones - CAR_LENGTH * 3,
      y: -window.intersectionArea.height / nZones / 2,
    },
    onLane: LANE_1,
    trajectory: GO_STRAIGHT,
    stage: 0,
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
renderer.setSize(Intersection.offsetWidth, Intersection.offsetWidth);
if (config.shadows) renderer.shadowMap.enabled = true;
Intersection.appendChild(renderer.domElement);

reset();

function reset() {
  // Render the scene
  renderer.render(scene, camera);
  ready = true;
}

startGame();

function startGame() {
  if (ready) {
    ready = false;
  }
}

let animationInterval = null;
let counter = 0;
let numOfSteps = 0;
const TIME_DELTA = 1000 / FPS;

const nextButton = document.getElementById('next');

const getStepNext = () => {
  return numOfSteps >= 4 ? [0, 1, 2, 4] : [0, 1, 2, 3, 4];
};

const stepsStack = new Stack();

nextButton.addEventListener('click', () => {
  numOfSteps++;
  stepsStack.push(getStepNext());
  animationInterval = setInterval(_animation, TIME_DELTA);
  nextButton.disabled = true;
});
function _animation() {
  counter += TIME_DELTA;
  if (counter > FRAME_TIME) {
    counter = 0;
    clearInterval(animationInterval);
    nextButton.disabled = false;
    cars.forEach((car) => {
      if (stepsStack.top().includes(car.carId)) {
        car.stage++;
      }
    });
  } else {
    document.getElementById('step').innerHTML = `Step: ${numOfSteps}`;
    const t = counter / FRAME_TIME;
    cars.forEach((car) => {
      if (stepsStack.top().includes(car.carId)) {
        move(car, t);
      }
    });
    renderer.render(scene, camera);
  }
}

// https://stackoverflow.com/questions/35495812/move-an-object-along-a-path-or-spline-in-threejs
// https://juejin.cn/post/6976897135794978853
