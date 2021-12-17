import {
  FRAME_TIME,
  START,
  END,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  LANE_1,
  LANE_2,
  LANE_3,
  LANE_4,
} from './constants';

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
    if (toZone.x === atZone.x && toZone.y === atZone.y) {
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
    car.onLane = LANE_4;
    if (!car.hasTurned) {
      car.hasTurned = true;
      car.radius = Math.abs(car.position.y);
    }
    turnLeft(car, timeDelta);
  } else if (car.prevTrajectory === DOWN && toZone.x > atZone.x) {
    // TODO: refactor onLane
    car.onLane = LANE_1;
    if (!car.hasTurned) {
      car.hasTurned = true;
      car.radius = Math.abs(car.position.x);
    }
    turnLeft(car, timeDelta);
  } else if (car.prevTrajectory === UP && toZone.x < atZone.x) {
    // TODO: refactor onLane
    car.onLane = LANE_2;
    if (!car.hasTurned) {
      car.hasTurned = true;
      car.radius = Math.abs(car.position.x);
    }
    turnLeft(car, timeDelta);
  }
};

const moveCarByLane = (car, timestamp, timeDelta) => {
  const laneSwitch = {
    [LANE_1]: moveRight,
    [LANE_2]: moveLeft,
    [LANE_3]: moveDown,
    [LANE_4]: moveUp,
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

const center = window.gridWidth / 2;

const turnLeft = (car, timeDelta) => {
  const angleDelta = (Math.PI / 2 / FRAME_TIME) * timeDelta;
  car.playerAngleMoved += angleDelta;
  const totalPlayerAngle = car.playerAngleInitial + car.playerAngleMoved;

  const playerX = Math.cos(totalPlayerAngle) * car.radius;
  const playerY = Math.sin(totalPlayerAngle) * car.radius;

  car.position.x = playerX;
  car.position.y = playerY;

  car.rotation.z += angleDelta;
};
const turnRight = (car, timeDelta) => {
  const angleDelta = (Math.PI / 2 / FRAME_TIME) * timeDelta;
  car.playerAngleMoved += angleDelta;
  const totalPlayerAngle = car.playerAngleInitial + car.playerAngleMoved;
  const playerX =
    Math.sin(totalPlayerAngle) * car.radius + playerCar.startTurnLeft;
  const playerY = Math.cos(totalPlayerAngle) * car.radius;

  car.position.x = playerX;
  car.position.y = playerY;

  car.rotation.z -= angleDelta;
};

export {move};
