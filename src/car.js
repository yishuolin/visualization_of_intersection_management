import {
  LEFT,
  RIGHT,
  UP,
  DOWN,
  LANE_1,
  LANE_2,
  LANE_3,
  LANE_4,
  CAR_HEIGHT,
  CAR_WIDTH,
  CAR_LENGTH,
} from './constants';

const getStartTrajectory = {
  [LANE_1]: RIGHT,
  [LANE_2]: LEFT,
  [LANE_3]: DOWN,
  [LANE_4]: UP,
};

const getPlayerAngleInitial = {
  [LANE_1]: (Math.PI / 2) * 3,
  [LANE_2]: Math.PI / 2,
  [LANE_3]: Math.PI,
  [LANE_4]: 0,
};

const getRotationZ = {
  [LANE_1]: 0,
  [LANE_2]: Math.PI,
  [LANE_3]: (Math.PI / 2) * 3,
  [LANE_4]: Math.PI / 2,
};

function Car(config) {
  const car = new THREE.Group();

  const color = 0xa52523;

  const main = new THREE.Mesh(
    new THREE.BoxBufferGeometry(CAR_LENGTH, CAR_WIDTH, CAR_HEIGHT),
    // new THREE.BoxBufferGeometry(30, 30, 15),
    new THREE.MeshLambertMaterial({color}),
  );
  main.position.z = 12;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  car.zones = config.zones;
  car.position.x = config.position.x;
  car.position.y = config.position.y;
  car.onLane = config.onLane;
  car.prevTrajectory = getStartTrajectory[config.onLane];
  car.rotation.z = getRotationZ[config.onLane];
  // turn
  car.hasTurned = false;
  car.radius = 0;
  car.playerAngleMoved = 0;
  car.playerAngleInitial = getPlayerAngleInitial[config.onLane];

  car.mesh = main;
  return car;
}

export {Car};
