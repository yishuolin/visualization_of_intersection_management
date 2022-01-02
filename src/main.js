import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {ambientLight, dirLight} from './light';
import {camera} from './camera';
import {getRoad} from './road';
import {Car} from './car';
import {move} from './controller';
import {
  Stack,
  laneAdapter,
  getInitialPosition,
  decrement,
  increment,
  cycleValidationFail,
} from './utils';
import {nZones, FRAME_TIME, TIME_DELTA, MAX_PREV_STEPS} from './constants';
import IntersectionSimulation from './intersection-management/intersectionSimulation';

const showShadows = true;
let autoInterval = null;
let animationInterval = null;
let counter = 0;
let numOfSteps = 0;
let isReversed = false;

const IS = new IntersectionSimulation(MAX_PREV_STEPS);
document.getElementById('randCars').onclick = () => generateRandomCars();
document.getElementById('randSol').onclick = () => IS.pickRandomSolution();
document.getElementById('checkCycle').onclick = () =>
  console.log(IS.isCycleExist(true));
document.getElementById('reset').onclick = () => reset();
document.getElementById('showOnlyZones').onclick = () => IS.showOnlyZones();
document.getElementById('showFull').onclick = () => IS.showFull();
document.getElementById('isDeadlock').onclick = () =>
  console.log(IS.isDeadlock());
document.getElementById('file-input').onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    IS.userGraph(reader.result);
    reset();
  };
  reader.readAsText(file);
};

const totalCarsInput = document.getElementById('total-cars');
const maxCarsPerLaneInput = document.getElementById('max-cars-per-lane');

const Intersection = document.getElementById('intersection');

const scene = new THREE.Scene();

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
renderer.setSize(Intersection.offsetWidth, Intersection.offsetHeight);
if (showShadows) renderer.shadowMap.enabled = true;
Intersection.appendChild(renderer.domElement);

const getCarsConfig = (cars) =>
  Object.keys(cars).map((key) => {
    const car = cars[key];
    return {
      carId: parseInt(key),
      trajectory: car.direction,
      onLane: car.lane,
      stage: 0,
      position: getInitialPosition[car.lane](car),
      targetLane: laneAdapter[car.targetLane],
      order: car.order,
    };
  });

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 3;
controls.minPolarAngle = 0;
controls.maxZoom = 3;
controls.minZoom = 0.6;

let cars = [];

const autoSwitch = document.getElementById('auto');
autoSwitch.addEventListener('change', function () {
  if (IS.isCycleExist()) {
    cycleValidationFail();
    this.checked = !this.checked;
    return;
  }
  if (this.checked) {
    document.getElementById('reset').disabled = true;
    handleNext();
    autoInterval = setInterval(() => {
      handleNext();
    }, FRAME_TIME);
  } else {
    document.getElementById('reset').disabled = false;
    clearInterval(autoInterval);
  }
});
const showFullGraphSwitch = document.getElementById('show-full-graph');
showFullGraphSwitch.addEventListener('change', function () {
  this.checked ? IS.showFull() : IS.showOnlyZones();
});

const start = () => {
  IS.randomGraph(totalCarsInput.value, maxCarsPerLaneInput.value);
  reset();
};

function generateRandomCars() {
  if (!totalCarsInput.value || !maxCarsPerLaneInput.value) {
    alert('Please enter the number of cars and max cars per lane');
    return;
  }
  if (totalCarsInput.value <= 0 || maxCarsPerLaneInput.value <= 0) {
    alert('Please enter a number greater than 0');
    return;
  }
  start();
}

function reset() {
  // remove cars from scene
  cars.forEach((car) => {
    scene.remove(car);
  });

  // reset variables
  numOfSteps = 0;
  document.getElementById('step').innerHTML = `Step: ${numOfSteps}`;
  isReversed = false;
  if (autoSwitch.checked) {
    autoSwitch.click();
  }
  if (!showFullGraphSwitch.checked) {
    IS.showOnlyZones();
  }

  const carsConfig = getCarsConfig(IS.reset());
  cars = carsConfig.map((config) => {
    const car = Car(config);
    scene.add(car);
    return car;
  });

  renderer.render(scene, camera);
}

start();

const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
prevButton.disabled = true;
// TODO: handle click autoSwitch when next/prev is clicked

const getStepNext = () => {
  const next = IS.stepNext();
  console.log(next);
  return next.map((x) => parseInt(x));
};

const stepsStack = new Stack();
const handleNext = () => {
  if (IS.isCycleExist()) {
    cycleValidationFail();
    return;
  }
  isReversed = false;
  numOfSteps++;
  stepsStack.push(getStepNext());
  animationInterval = setInterval(animation, TIME_DELTA);
  nextButton.disabled = true;
  prevButton.disabled = true;
};
const handlePrev = () => {
  if (IS.isCycleExist()) {
    cycleValidationFail();
    return;
  }
  isReversed = true;
  numOfSteps--;
  IS.stepPrev();
  animationInterval = setInterval(animation, TIME_DELTA);
  nextButton.disabled = true;
  prevButton.disabled = true;
};

nextButton.addEventListener('click', handleNext);
prevButton.addEventListener('click', handlePrev);

function animation() {
  counter += TIME_DELTA;
  if (counter > FRAME_TIME) {
    counter = 0;
    clearInterval(animationInterval);
    if (!autoSwitch.checked) {
      nextButton.disabled = false;
      prevButton.disabled = numOfSteps === 0;
    }
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

// counter
const decrementButtons = document.querySelectorAll(
  `button[data-action="decrement"]`,
);

const incrementButtons = document.querySelectorAll(
  `button[data-action="increment"]`,
);

decrementButtons.forEach((btn) => {
  btn.addEventListener('click', decrement);
});

incrementButtons.forEach((btn) => {
  btn.addEventListener('click', increment);
});
