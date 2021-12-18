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

const getNextLane = (currentLane, turn) => {
  switch (currentLane) {
    case LANE_1:
      return turn === LEFT ? LANE_4 : LANE_3;
    case LANE_2:
      return turn === LEFT ? LANE_3 : LANE_4;
    case LANE_3:
      return turn === LEFT ? LANE_1 : LANE_2;
    case LANE_4:
      return turn === LEFT ? LANE_2 : LANE_1;
  }
};

const getRadius = (position, prevTrajectory) => {
  return prevTrajectory === UP || prevTrajectory === DOWN
    ? Math.abs(position.x)
    : Math.abs(position.y);
};

const move = (car, numOfFrame, timeDelta) => {
  // const numOfFrame = Math.floor(timestamp / FRAME_TIME);
  const fromZone = numOfFrame > 0 ? car.zones[numOfFrame - 1] : START;
  const atZone = car.zones[numOfFrame];
  const toZone =
    numOfFrame < car.zones.length - 1 ? car.zones[numOfFrame + 1] : END;

  if (fromZone === START) {
    if (toZone.x === atZone.x && toZone.y === atZone.y) {
      return;
    }
    moveCarByLane(car, timeDelta);
    return;
  } else if (toZone === END) {
    moveCarByLane(car, timeDelta);
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
  } else if (
    (car.prevTrajectory === RIGHT && toZone.y > atZone.y) ||
    (car.prevTrajectory === LEFT && toZone.y < atZone.y) ||
    (car.prevTrajectory === DOWN && toZone.x > atZone.x) ||
    (car.prevTrajectory === UP && toZone.x < atZone.x)
  ) {
    if (!car.hasTurned) {
      car.onLane = getNextLane(car.onLane, LEFT);
      car.hasTurned = true;
      car.radius = getRadius(car.position, car.prevTrajectory);
    }
    turnLeft(car, timeDelta);
  }
};

const moveCarByLane = (car, timeDelta) => {
  const laneSwitch = {
    [LANE_1]: moveRight,
    [LANE_2]: moveLeft,
    [LANE_3]: moveDown,
    [LANE_4]: moveUp,
  };
  laneSwitch[car.onLane](car, timeDelta);
};

const moveRight = (car, timeDelta) => {
  car.position.x += getPlayerSpeed() * timeDelta;
};

const moveLeft = (car, timeDelta) => {
  car.position.x -= getPlayerSpeed() * timeDelta;
};

const moveUp = (car, timeDelta) => {
  car.position.y += getPlayerSpeed() * timeDelta;
};

const moveDown = (car, timeDelta) => {
  car.position.y -= getPlayerSpeed() * timeDelta;
};

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
