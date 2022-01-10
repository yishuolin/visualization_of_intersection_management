import {ambientLight, dirLight} from './light';
import {camera} from './camera';
import {getRoad} from './road';
import {Car} from './car';
import {move} from './controller';
import {setupOrbitControls} from './orbitControls';
import {
  Stack,
  getCarsConfig,
  decrement,
  increment,
  cycleValidationFail,
} from './utils';
import {nZones, FRAME_TIME, TIME_DELTA, MAX_PREV_STEPS} from './constants';
import IntersectionSimulation from './intersection-management/intersectionSimulation';

const showShadows = true;
const steps = new Stack();
let cars = [];
let autoInterval = null;
let animationInterval = null;
let counter = 0;
let numOfSteps = 0;
let isReversed = false;

const IS = new IntersectionSimulation(MAX_PREV_STEPS);
document.getElementById('randCars').onclick = () => generateRandomCars();
document.getElementById('randSol').onclick = () => {
  if (showCycleSwitch.checked) showCycleSwitch.click();
  IS.pickRandomSolution();
};
document.getElementById('reset').onclick = () => reset();
document.getElementById('file-input').onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    IS.userGraph(reader.result);
    reset();
  };
  reader.readAsText(file);
};

// get DOM elements
const Intersection = document.getElementById('intersection');
const totalCarsInput = document.getElementById('total-cars');
const maxCarsPerLaneInput = document.getElementById('max-cars-per-lane');
const autoSwitch = document.getElementById('auto');
const showFullGraphSwitch = document.getElementById('show-full-graph');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const showCycleSwitch = document.getElementById('show-cycle');

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

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(Intersection.offsetWidth, Intersection.offsetHeight);
if (showShadows) renderer.shadowMap.enabled = true;
Intersection.appendChild(renderer.domElement);

setupOrbitControls(camera, renderer);

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
      if (IS.isDeadlock()) {
        alert('Deadlock detected.');
        clearInterval(autoInterval);
        autoSwitch.click();
        nextButton.disabled = false;
        prevButton.disabled = numOfSteps === 0;
        return;
      }
      handleNext();
    }, FRAME_TIME);
  } else {
    document.getElementById('reset').disabled = false;
    clearInterval(autoInterval);
  }
});

// handle toggle switches
showFullGraphSwitch.addEventListener('change', function () {
  this.checked ? IS.showFull() : IS.showOnlyZones();
});
showCycleSwitch.addEventListener('change', function () {
  this.checked ? IS.showCycle(true) : IS.showCycle(false);
});

const start = () => {
  IS.randomGraph(totalCarsInput.value, maxCarsPerLaneInput.value);
  reset();
};

function generateRandomCars() {
  if (!totalCarsInput.value || !maxCarsPerLaneInput.value) {
    alert('Please enter the number of cars and max cars per lane.');
    return;
  }
  if (totalCarsInput.value <= 0 || maxCarsPerLaneInput.value <= 0) {
    alert('Please enter a number greater than 0.');
    return;
  }
  reset();
  start();
}

function reset() {
  animationInterval && clearInterval(animationInterval);
  autoInterval && clearInterval(autoInterval);

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
  showFullGraphSwitch.checked || IS.showOnlyZones();

  cars = getCarsConfig(IS.reset()).map((config) => new Car(config));
  cars.forEach((car) => scene.add(car));

  renderer.render(scene, camera);
}

start();

prevButton.disabled = true;
// TODO: handle click autoSwitch when next/prev is clicked

const getStepNext = () => {
  const next = IS.stepNext();
  console.log(next);
  return next.map((x) => parseInt(x));
};

const handleNext = () => {
  if (IS.isCycleExist()) {
    cycleValidationFail();
    return;
  }
  if (IS.isDeadlock()) {
    alert('Deadlock detected.');
    return;
  }
  isReversed = false;
  numOfSteps++;
  steps.push(getStepNext());
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
      if (steps.top().includes(car.carId)) {
        car.stage += isReversed ? -1 : 1;
      }
    });
    if (isReversed) steps.pop();
  } else {
    document.getElementById('step').innerHTML = `Step: ${numOfSteps}`;
    cars.forEach((car) => {
      if (steps.top().includes(car.carId)) {
        move(car, counter / FRAME_TIME, isReversed);
      }
    });
  }
}
setInterval(() => renderer.render(scene, camera), 10);

// handle counters
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
