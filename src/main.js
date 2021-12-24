import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {ambientLight, dirLight} from './light';
import {camera} from './camera';
import {getRoad} from './road';
import {Car} from './car';
import {move} from './controller';
import {Stack, laneAdapter, getInitialPosition} from './utils';
import {nZones, FRAME_TIME, FPS, MAX_PREV_STEPS} from './constants';
import IntersectionSimulation from './intersection-management/intersectionSimulation';

const IS = new IntersectionSimulation(MAX_PREV_STEPS);
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

const showShadows = true;

const scene = new THREE.Scene();

// scene.add(getRoad(cameraWidth, cameraHeight * 2, nZones)); // Original Code: The map height is higher because we look at the map from an angle
scene.add(
  getRoad(
    Intersection.offsetHeight * 2.5,
    Intersection.offsetHeight * 2.5,
    nZones,
  ),
);

scene.add(ambientLight);
scene.add(dirLight);

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
        // stage: 1 - (car.order - 1), // TODO
        stage: 0,
        position: getInitialPosition[car.lane](car),
        targetLane: laneAdapter[car.targetLane],
        order: car.order,
      });
    }
  }
};

renderer.setSize(Intersection.offsetWidth, Intersection.offsetHeight);
if (showShadows) renderer.shadowMap.enabled = true;
Intersection.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 3;
controls.minPolarAngle = 0;

function reset() {
  IS.randomGraph(6, 4);
  getCarsConfig(IS.reset());
}
reset();

const addCar = (scene, config) => {
  const car = Car(config);
  scene.add(car);
  return car;
};

const cars = carsConfig.map((config) => {
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
  IS.stepPrev();
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
setInterval(() => renderer.render(scene, camera), 10);
// https://stackoverflow.com/questions/35495812/move-an-object-along-a-path-or-spline-in-threejs
// https://juejin.cn/post/6976897135794978853
