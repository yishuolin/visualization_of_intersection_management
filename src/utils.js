import {font} from './font';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {LANE_1, LANE_2, LANE_3, LANE_4, CAR_LENGTH, nZones} from './constants';

function Stack() {
  const items = [];
  this.push = function (element) {
    items.push(element);
  };
  this.pop = function () {
    return items.pop();
  };
  this.top = function () {
    return items[items.length - 1];
  };
  this.isEmpty = function () {
    return items.length === 0;
  };
  this.clear = function () {
    items = [];
  };
  this.size = function () {
    return items.length;
  };
}

const getRotationZ = {
  [LANE_1]: 0,
  [LANE_2]: Math.PI,
  [LANE_3]: Math.PI * 1.5,
  [LANE_4]: Math.PI / 2,
};

const getRandomColor = (id) => {
  Math.seedrandom(id);
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random(id) * 16)];
  }
  Math.seedrandom(); // reset seed
  return color;
};

const laneAdapter = {
  'lane_-1': LANE_2,
  'lane_-2': LANE_1,
  'lane_-3': LANE_4,
  'lane_-4': LANE_3,
};

const getInitialPosition = {
  [LANE_1]: (car) => ({
    x:
      -window.intersectionArea.width / nZones -
      CAR_LENGTH * (car.order * 2 - 1),
    y: -window.intersectionArea.height / nZones / 2,
  }),
  [LANE_2]: (car) => ({
    x:
      window.intersectionArea.width / nZones + CAR_LENGTH * (car.order * 2 - 1),
    y: window.intersectionArea.height / nZones / 2,
  }),
  [LANE_3]: (car) => ({
    x: -window.intersectionArea.width / nZones / 2,
    y:
      window.intersectionArea.height / nZones +
      CAR_LENGTH * (car.order * 2 - 1),
  }),
  [LANE_4]: (car) => ({
    x: window.intersectionArea.width / nZones / 2,
    y:
      -window.intersectionArea.height / nZones -
      CAR_LENGTH * (car.order * 2 - 1),
  }),
};

function Text(string, size = 15) {
  // https://github.com/tamani-coding/threejs-text-example/blob/main/src/basic_scene.ts
  const geometry = new TextGeometry(string, {
    font: font,
    size: size,
    height: 1,
    curveSegments: 10,
    bevelEnabled: false,
    bevelOffset: 0,
    bevelSegments: 1,
    bevelSize: 0.3,
    bevelThickness: 1,
  }).center();
  const materials = [
    new THREE.MeshPhongMaterial({color: 0x000000}), // front
    new THREE.MeshPhongMaterial({color: 0x000000}), // side
  ];
  const textMesh = new THREE.Mesh(geometry, materials);
  return textMesh;
}

function decrement(e) {
  const btn = e.target.parentNode.parentElement.querySelector(
    'button[data-action="decrement"]',
  );
  const target = btn.nextElementSibling;
  let value = Number(target.value);
  value--;
  target.value = value;
}

function increment(e) {
  const btn = e.target.parentNode.parentElement.querySelector(
    'button[data-action="decrement"]',
  );
  const target = btn.nextElementSibling;
  let value = Number(target.value);
  value++;
  target.value = value;
}

const cycleValidationFail = () => {
  alert('Please remove the cycle(s) first.');
};
export {
  Stack,
  getRotationZ,
  getRandomColor,
  laneAdapter,
  getInitialPosition,
  Text,
  decrement,
  increment,
  cycleValidationFail,
};
