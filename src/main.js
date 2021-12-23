import {ambientLight, dirLight} from './light';
import {camera} from './camera';
import {getRoad} from './road';
import {Car} from './car';
import {move} from './controller';
import {Stack} from './utils';
import {
  nZones,
  FRAME_TIME,
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

const showShadows = false;

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

// Set up renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  // powerPreference: 'high-performance',
});
renderer.setSize(Intersection.offsetWidth, Intersection.offsetWidth);
if (showShadows) renderer.shadowMap.enabled = true;
Intersection.appendChild(renderer.domElement);

reset();

function reset() {
  renderer.render(scene, camera);
}

let animationInterval = null;
let counter = 0;
let numOfSteps = 0;
const TIME_DELTA = 1000 / FPS;
let isReversed = false;

const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
prevButton.disabled = true;

const getStepNext = () => {
  return numOfSteps >= 4 ? [0, 1, 2, 4] : [0, 1, 2, 3, 4];
};

const stepsStack = new Stack();

nextButton.addEventListener('click', () => {
  isReversed = false;
  numOfSteps++;
  stepsStack.push(getStepNext());
  animationInterval = setInterval(animation, TIME_DELTA);
  nextButton.disabled = true;
  prevButton.disabled = true;
});
prevButton.addEventListener('click', () => {
  isReversed = true;
  numOfSteps--;
  animationInterval = setInterval(animation, TIME_DELTA);
  nextButton.disabled = true;
  prevButton.disabled = true;
});

function animation() {
  counter += TIME_DELTA;
  if (counter > FRAME_TIME) {
    counter = 0;
    clearInterval(animationInterval);
    nextButton.disabled = false;
    prevButton.disabled = numOfSteps === 0;
    cars.forEach((car) => {
      if (stepsStack.top().includes(car.carId)) {
        car.stage += isReversed ? -1 : 1;
      }
    });
    if (isReversed) stepsStack.pop();
  } else {
    document.getElementById('step').innerHTML = `Step: ${numOfSteps}`;
    cars.forEach((car) => {
      if (stepsStack.top().includes(car.carId)) {
        move(car, counter / FRAME_TIME, isReversed);
      }
    });
    renderer.render(scene, camera);
  }
}

// https://stackoverflow.com/questions/35495812/move-an-object-along-a-path-or-spline-in-threejs
// https://juejin.cn/post/6976897135794978853
