import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
import IntersectionSimulation from './intersection-management/intersectionSimulation';

const IS = new IntersectionSimulation(4);
document.getElementById('randCars').onclick = (e) => IS.randomGraph(6, 2);
document.getElementById('randSol').onclick = (e) => IS.pickRandomSolution();
document.getElementById('checkCycle').onclick = (e) =>
  console.log(IS.isCycleExist(true));
document.getElementById('reset').onclick = (e) => console.log(IS.reset());
document.getElementById('showOnlyZones').onclick = (e) => IS.showOnlyZones();
document.getElementById('showFull').onclick = (e) => IS.showFull();
document.getElementById('stepNext').onclick = (e) => console.log(IS.stepNext());
document.getElementById('stepPrev').onclick = (e) => IS.stepPrev();

const Intersection = document.getElementById('intersection');

const showShadows = true  ;

const scene = new THREE.Scene();

// scene.add(getRoad(cameraWidth, cameraHeight * 2, nZones)); // Original Code: The map height is higher because we look at the map from an angle
scene.add(
  getRoad(Intersection.offsetHeight * 2, Intersection.offsetHeight * 2, nZones),
);

scene.add(ambientLight);
scene.add(dirLight);

// const carsConfig = [
//   {
//     carId: 0,
//     position: {
//       // TODO: should be dynamic
//       x: -window.intersectionArea.width / nZones - CAR_LENGTH,
//       y: -window.intersectionArea.height / nZones / 2,
//     },
//     onLane: LANE_1,
//     trajectory: TURN_LEFT,
//     stage: 1,
//   },
//   {
//     carId: 1,
//     position: {
//       x: window.intersectionArea.width / nZones + CAR_LENGTH,
//       y: window.intersectionArea.height / nZones / 2,
//     },
//     onLane: LANE_2,
//     trajectory: TURN_LEFT,
//     stage: 1,
//   },
//   {
//     carId: 2,
//     position: {
//       x: window.intersectionArea.width / nZones / 2,
//       y: -window.intersectionArea.height / nZones - CAR_LENGTH,
//     },
//     onLane: LANE_4,
//     trajectory: GO_STRAIGHT,
//     stage: 1,
//   },
//   {
//     carId: 3,
//     position: {
//       x: -window.intersectionArea.width / nZones / 2,
//       y: window.intersectionArea.height / nZones + CAR_LENGTH,
//     },
//     onLane: LANE_3,
//     trajectory: TURN_RIGHT,
//     stage: 1,
//   },
//   {
//     carId: 4,
//     position: {
//       x: -window.intersectionArea.width / nZones - CAR_LENGTH * 3,
//       y: -window.intersectionArea.height / nZones / 2,
//     },
//     onLane: LANE_1,
//     trajectory: GO_STRAIGHT,
//     stage: 0,
//   },
// ];

// Set up renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});

let carsConfig = [];

const getCarsConfig = (cars) => {
  for (let key in cars) {
    if (cars.hasOwnProperty(key)) {
      let car = cars[key];
      carsConfig.push({
        carId: parseInt(key),
        trajectory: car.direction,
        onLane: car.lane,
        stage: 1 - (car.order - 1), // TODO
        position: getInitialPosition(car),
      });
    }
  }
};

const getInitialPosition = (car) => {
  switch (car.lane) {
    case LANE_1:
      return {
        x:
          -window.intersectionArea.width / nZones -
          CAR_LENGTH * (car.order === 1 ? 1 : 3),
        y: -window.intersectionArea.height / nZones / 2,
      };
    case LANE_2:
      return {
        x:
          window.intersectionArea.width / nZones +
          CAR_LENGTH * (car.order === 1 ? 1 : 3),
        y: window.intersectionArea.height / nZones / 2,
      };
    case LANE_3:
      return {
        x: -window.intersectionArea.width / nZones / 2,
        y:
          window.intersectionArea.height / nZones +
          CAR_LENGTH * (car.order === 1 ? 1 : 3),
      };
    case LANE_4:
      return {
        x: window.intersectionArea.width / nZones / 2,
        y:
          -window.intersectionArea.height / nZones -
          CAR_LENGTH * (car.order === 1 ? 1 : 3),
      };
  }
};

renderer.setSize(Intersection.offsetWidth, Intersection.offsetWidth);
if (showShadows) renderer.shadowMap.enabled = true;
Intersection.appendChild(renderer.domElement);
const controls = new OrbitControls( camera, renderer.domElement );

function reset() {
  IS.randomGraph(6, 2);
  getCarsConfig(IS.reset());
}
reset();

const addCar = (scene, config) => {
  const car = Car(config);
  scene.add(car);
  return car;
};

const cars = carsConfig.map((config) => {
  console.log(config);
  const car = addCar(scene, config);
  return car;
});
renderer.render(scene, camera);

let animationInterval = null;
let counter = 0;
let numOfSteps = 0;
const TIME_DELTA = 1000 / FPS;
let isReversed = false;

const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
prevButton.disabled = true;

const getStepNext = () => {
  // return numOfSteps >= 4 ? [0, 1, 2, 4] : [0, 1, 2, 3, 4];
  const next = IS.stepNext();
  console.log(next);
  return next.map((x) => parseInt(x));
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
  }
}
setInterval(()=>renderer.render(scene, camera), 10)
// https://stackoverflow.com/questions/35495812/move-an-object-along-a-path-or-spline-in-threejs
// https://juejin.cn/post/6976897135794978853
