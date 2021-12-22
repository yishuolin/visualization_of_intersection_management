import {getPaths} from './road';
import {CAR_HEIGHT, CAR_WIDTH, CAR_LENGTH} from './constants';
import {getRotationZ, getRandomColor} from './utils';

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
  car.paths = getPaths(car, config.trajectory);
  car.mesh = main;

  return car;
}

export {Car};
