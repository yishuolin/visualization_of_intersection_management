import {FRAME_TIME, START, END, LEFT, RIGHT, UP, DOWN} from './constants';

const playerAngleInitial = Math.PI;
let playerAngleMoved = 0;

const getPlayerSpeed = () => {
  return window.gridWidth / FRAME_TIME;
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

  if (car.prevTrajectory === RIGHT && toZone.x > atZone.x) {
    moveRight(car, timeDelta);
  } else if (car.prevTrajectory === LEFT && toZone.x < atZone.x) {
    moveLeft(car, timeDelta);
  } else if (car.prevTrajectory === UP && toZone.y > atZone.y) {
    moveUp(car, timeDelta);
  } else if (car.prevTrajectory === DOWN && toZone.y < atZone.y) {
    moveDown(car, timeDelta);
  } else if (car.prevTrajectory === RIGHT && toZone.y > atZone.y) {
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
  const laneSwitch = {
    1: moveRight,
    2: moveLeft,
    3: moveDown,
    4: moveUp,
  };
  laneSwitch[car.onLane](car, timeDelta);
};

const moveRight = (car, timeDelta) => {
  const playerSpeed = getPlayerSpeed();
  car.position.x += playerSpeed * timeDelta;
};

const moveLeft = (car, timeDelta) => {
  const playerSpeed = getPlayerSpeed();
  car.position.x -= playerSpeed * timeDelta;
};

const moveUp = (car, timeDelta) => {
  const playerSpeed = getPlayerSpeed();
  car.position.y += playerSpeed * timeDelta;
};

const moveDown = (car, timeDelta) => {
  const playerSpeed = getPlayerSpeed();
  car.position.y -= playerSpeed * timeDelta;
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
