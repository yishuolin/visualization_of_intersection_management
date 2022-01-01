import {getPaths} from './road';
import {CAR_HEIGHT, CAR_WIDTH, CAR_LENGTH} from './constants';
import {getRotationZ, getRandomColor, Text} from './utils';
const showTexture = true;

function Car(config) {
  const car = new THREE.Group();

  const color = getRandomColor();
  const main = new THREE.Mesh(
    new THREE.BoxBufferGeometry(CAR_LENGTH, CAR_WIDTH, CAR_HEIGHT),
    new THREE.MeshLambertMaterial({color}),
  );

  main.position.z = 12;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  car.carId = config.carId;
  car.zones = config.zones;
  car.position.x = config.position.x;
  car.position.y = config.position.y;
  car.onLane = config.onLane;
  car.rotation.z = getRotationZ[config.onLane];
  car.stage = config.stage;
  car.paths = getPaths(car, config.trajectory, config.order);
  car.targetLane = config.targetLane;

  car.mesh = main;

  if (showTexture) {
    addDetailedTexture(car);
  }

  return car;
}

function getCarFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const context = canvas.getContext('2d');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 64, 32);

  context.fillStyle = '#666666';
  context.fillRect(8, 8, 48, 24);

  return new THREE.CanvasTexture(canvas);
}

function getCarSideTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const context = canvas.getContext('2d');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 128, 32);

  context.fillStyle = '#666666';
  context.fillRect(10, 8, 38, 24);
  context.fillRect(58, 8, 60, 24);

  return new THREE.CanvasTexture(canvas);
}

function Wheel() {
  const wheelGeometry = new THREE.BoxBufferGeometry(12, 33, 12);
  const wheelMaterial = new THREE.MeshLambertMaterial({color: 0x333333});
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.position.z = 6;
  wheel.castShadow = false;
  wheel.receiveShadow = false;
  return wheel;
}

const addDetailedTexture = (car) => {
  const carFrontTexture = getCarFrontTexture();
  carFrontTexture.center = new THREE.Vector2(0.5, 0.5);
  carFrontTexture.rotation = Math.PI / 2;

  const carBackTexture = getCarFrontTexture();
  carBackTexture.center = new THREE.Vector2(0.5, 0.5);
  carBackTexture.rotation = -Math.PI / 2;

  const carLeftSideTexture = getCarSideTexture();
  carLeftSideTexture.flipY = false;

  const carRightSideTexture = getCarSideTexture();

  const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33, 24, 12), [
    new THREE.MeshLambertMaterial({map: carFrontTexture}),
    new THREE.MeshLambertMaterial({map: carBackTexture}),
    new THREE.MeshLambertMaterial({map: carLeftSideTexture}),
    new THREE.MeshLambertMaterial({map: carRightSideTexture}),
    new THREE.MeshLambertMaterial({color: 0xffffff}), // top
    new THREE.MeshLambertMaterial({color: 0xffffff}), // bottom
  ]);
  cabin.position.x = -6;
  cabin.position.z = 25.5;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  const backWheel = new Wheel();
  backWheel.position.x = -18;
  car.add(backWheel);

  const frontWheel = new Wheel();
  frontWheel.position.x = 18;
  car.add(frontWheel);

  const text = new Text(String(car.carId));
  text.position.z = 35;
  text.position.x = -5;
  text.rotation.z = -Math.PI / 2;
  car.add(text);
};

export {Car};
