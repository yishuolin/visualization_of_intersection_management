import {FRAME_TIME, START, END} from './constants';
const speed = 0.0017;
const playerAngleInitial = Math.PI;
let playerAngleMoved = 0;

const getPlayerSpeed = () => {
  const {gridWidth} = window;
  return speed;
};

const move = (car, timestamp, timeDelta) => {
  const numOfFrame = Math.floor(timestamp / FRAME_TIME);
  const fromZone = numOfFrame > 0 ? car.zones[numOfFrame - 1] : START;
  const atZone = car.zones[numOfFrame];
  const toZone =
    numOfFrame < car.zones.length - 1 ? car.zones[numOfFrame + 1] : END;

  if (fromZone === START) {
    if (toZone.x === atZone.x || toZone.y === atZone.y) {
      return;
    }
    moveCarByLane(car, timestamp, timeDelta);
    return;
  } else if (toZone === END) {
    moveCarByLane(car, timestamp, timeDelta);
    return;
  }

  if (car.prevTrajectory === 'right' && toZone.x > atZone.x) {
    moveRight(car, timeDelta);
  } else if (car.prevTrajectory === 'left' && toZone.x < atZone.x) {
    moveLeft(car, timeDelta);
  } else if (car.prevTrajectory === 'up' && toZone.y > atZone.y) {
    moveUp(car, timeDelta);
  } else if (car.prevTrajectory === 'down' && toZone.y < atZone.y) {
    moveDown(car, timeDelta);
  } else if (car.prevTrajectory === 'right' && toZone.y > atZone.y) {
    car.onLane = 4;
    if (!car.hasTurned) {
      car.hasTurned = true;
      car.startTurnLeft = car.position.x;
      car.radius = Math.abs(car.position.y);
    }
    turnLeft(car, timeDelta);
  } else {
    console.log('stop');
  }
};

const moveCarByLane = (car, timestamp, timeDelta) => {
  // TODO: need to consider other lanes
  if (car.onLane === 1) {
    moveRight(car, timeDelta);
  } else if (car.onLane === 4) {
    moveUp(car, timeDelta);
  }
};

const moveRight = (car, timeDelta) => {
  const playerSpeed = getPlayerSpeed();
  car.position.x += playerSpeed * timeDelta * 70;
};

const moveLeft = (car, timeDelta) => {
  const playerSpeed = getPlayerSpeed();
  car.position.x -= playerSpeed * timeDelta * 70;
};

const moveUp = (car, timeDelta) => {
  const playerSpeed = getPlayerSpeed();
  car.position.y += playerSpeed * timeDelta * 70;
};

const moveDown = (car, timeDelta) => {
  const playerSpeed = getPlayerSpeed();
  car.position.y -= playerSpeed * timeDelta * 70;
};

const turnLeft = (car, timeDelta) => {
  const angleDelta = (Math.PI / 2 / FRAME_TIME) * timeDelta;
  playerAngleMoved -= angleDelta;
  const totalPlayerAngle = playerAngleInitial + playerAngleMoved;
  const playerX = Math.sin(totalPlayerAngle) * car.radius + car.startTurnLeft;
  const playerY = Math.cos(totalPlayerAngle) * car.radius;

  car.position.x = playerX;
  car.position.y = playerY;

  car.rotation.z += angleDelta;
};
const turnRight = (car, timeDelta) => {
  const angleDelta = (Math.PI / 2 / FRAME_TIME) * timeDelta;
  playerAngleMoved += angleDelta;
  const totalPlayerAngle = playerAngleInitial + playerAngleMoved;
  const playerX =
    Math.sin(totalPlayerAngle) * car.radius + playerCar.startTurnLeft;
  const playerY = Math.cos(totalPlayerAngle) * car.radius;

  car.position.x = playerX;
  car.position.y = playerY;

  car.rotation.z -= angleDelta;
};

export {move};
