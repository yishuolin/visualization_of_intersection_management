import {
  TRACK_COLOR,
  BARRIER_LINE_COLOR,
  ZONE_LINE_COLOR,
  BARRIER_LINE_WIDTH,
  ZONE_LINE_WIDTH,
  INTERSECTION_AREA_SIZE,
  LANE_1,
  LANE_2,
  LANE_3,
  LANE_4,
  TURN_LEFT,
  TURN_RIGHT,
  GO_STRAIGHT,
  CAR_LENGTH,
} from './constants';

const RADIAN_0 = 0;
const RADIAN_90 = Math.PI / 2;
const RADIAN_180 = Math.PI;
const RADIAN_270 = Math.PI * 1.5;
const RADIAN_315 = Math.PI * 1.75;
const RADIAN_360 = Math.PI * 2;

function getCircle(x1, y1, r, theta_start, theta_end) {
  const points = [];
  const theta_step = 0.01;
  if (theta_start > theta_end) {
    for (let theta = theta_start; theta >= theta_end; theta -= theta_step) {
      const x = x1 + r * Math.cos(theta);
      const y = y1 + r * Math.sin(theta);
      points.push(new THREE.Vector3(x, y, 0));
    }
  } else {
    for (let theta = theta_start; theta < theta_end; theta += theta_step) {
      const x = x1 + r * Math.cos(theta);
      const y = y1 + r * Math.sin(theta);
      points.push(new THREE.Vector3(x, y, 0));
    }
  }
  return new THREE.CatmullRomCurve3(points);
}

function getLine(x1, y1, x2, y2) {
  const points = [];
  points.push(new THREE.Vector3(x1, y1, 0));
  points.push(new THREE.Vector3(x2, y2, 0));
  return new THREE.CatmullRomCurve3(points);
}

function getRoad(mapWidth, mapHeight, nZones) {
  const lineMarkingsTexture = getLineMarkings(
    mapWidth,
    mapHeight,
    INTERSECTION_AREA_SIZE,
    nZones,
  );

  const planeGeometry = new THREE.PlaneBufferGeometry(mapWidth, mapHeight);
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: lineMarkingsTexture,
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.matrixAutoUpdate = false;
  return plane;
}

function getLineMarkings(mapWidth, mapHeight, intersectionAreaSize, nZones) {
  const intersectionArea = {
    width: mapWidth * intersectionAreaSize,
    height: mapHeight * intersectionAreaSize,
  };
  const intersectionAreaStart = {
    x: mapWidth / 2 - intersectionArea.width / 2,
    y: mapHeight / 2 - intersectionArea.height / 2,
  };
  const intersectionAreaEnd = {
    x: mapWidth / 2 + intersectionArea.width / 2,
    y: mapHeight / 2 + intersectionArea.height / 2,
  };
  const canvas = document.createElement('canvas');
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext('2d');

  context.fillStyle = TRACK_COLOR;
  context.fillRect(0, 0, mapWidth, mapHeight);

  context.lineWidth = BARRIER_LINE_WIDTH;
  context.strokeStyle = BARRIER_LINE_COLOR;
  context.setLineDash([10, 14]);

  // vertical line
  context.beginPath();
  context.moveTo(mapWidth / 2, 0);
  context.lineTo(mapWidth / 2, intersectionAreaStart.y);
  context.moveTo(mapWidth / 2, intersectionAreaEnd.y);
  context.lineTo(mapWidth / 2, mapHeight);
  context.stroke();

  // horizontal line
  context.beginPath();
  context.moveTo(0, mapHeight / 2);
  context.lineTo(intersectionAreaStart.x, mapHeight / 2);
  context.moveTo(intersectionAreaEnd.x, mapHeight / 2);
  context.lineTo(mapWidth, mapHeight / 2);
  context.stroke();

  // draw conflict zones
  context.lineWidth = ZONE_LINE_WIDTH;
  context.strokeStyle = ZONE_LINE_COLOR;
  context.setLineDash([]);
  const gridWidth = intersectionArea.width / nZones;
  const gridHeight = intersectionArea.height / nZones;

  // TODO: need refactor, move to main
  window.gridWidth = gridWidth;
  window.gridHeight = gridHeight;
  window.intersectionAreaStart = intersectionAreaStart;
  window.intersectionAreaEnd = intersectionAreaEnd;
  window.intersectionArea = intersectionArea;

  for (let i = 0; i <= nZones; i++) {
    const offsetX = i * gridWidth;
    const offsetY = i * gridHeight;

    // vertical lines
    context.beginPath();
    context.moveTo(intersectionAreaStart.x + offsetX, intersectionAreaStart.y);
    context.lineTo(intersectionAreaStart.x + offsetX, intersectionAreaEnd.y);
    context.stroke();

    // horizontal lines
    context.beginPath();
    context.moveTo(intersectionAreaStart.x, intersectionAreaStart.y + offsetY);
    context.lineTo(intersectionAreaEnd.x, intersectionAreaStart.y + offsetY);
    context.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

const getPreTurnLeft = () => {
  return new THREE.CatmullRomCurve3([
    ...getLine(-gridWidth / 2, -gridWidth / 2, 0, -gridWidth / 2).getPoints(),
    ...getCircle(
      0,
      0,
      gridWidth / 2,
      RADIAN_270,
      (Math.PI * 7) / 4,
    ).getPoints(),
  ]);
};
const getPostTurnLeft = () => {
  return new THREE.CatmullRomCurve3([
    ...getCircle(0, 0, gridWidth / 2, Math.PI * 1.75, RADIAN_360).getPoints(),
    ...getLine(gridWidth / 2, 0, gridWidth / 2, gridWidth / 2).getPoints(),
  ]);
};
const getPostTurnRight = () => {
  return new THREE.CatmullRomCurve3([
    ...getCircle(
      -gridWidth,
      -gridWidth,
      gridWidth / 2,
      RADIAN_90 / 2,
      0,
    ).getPoints(),
    ...getLine(
      -gridWidth / 2,
      -gridWidth,
      -gridWidth / 2,
      -gridWidth - CAR_LENGTH,
    ).getPoints(),
  ]);
};

const getPreTurnRight = () => {
  return new THREE.CatmullRomCurve3([
    ...getLine(
      -gridWidth - CAR_LENGTH,
      -gridWidth / 2,
      -gridWidth,
      -gridWidth / 2,
    ).getPoints(),
    ...getCircle(
      -gridWidth,
      -gridWidth,
      gridWidth / 2,
      RADIAN_90,
      RADIAN_90 / 2,
    ).getPoints(),
  ]);
};

// TODO: duplicated with car.js
const getRotationZ = {
  [LANE_1]: 0,
  [LANE_2]: Math.PI,
  [LANE_3]: Math.PI * 1.5,
  [LANE_4]: Math.PI / 2,
};

const getBasePaths = () => ({
  [TURN_LEFT]: [
    getLine(
      -gridWidth - CAR_LENGTH * 3,
      -gridWidth / 2,
      -gridWidth - CAR_LENGTH,
      -gridWidth / 2,
    ), // TODO: duplicated
    getLine(
      -gridWidth - CAR_LENGTH,
      -gridWidth / 2,
      -gridWidth / 2,
      -gridWidth / 2,
    ),
    getPreTurnLeft(),
    getPostTurnLeft(),
    getLine(
      gridWidth / 2,
      gridWidth / 2,
      gridWidth / 2,
      gridWidth + CAR_LENGTH,
    ),
    getLine(
      gridWidth / 2,
      gridWidth + CAR_LENGTH,
      gridWidth / 2,
      gridWidth + CAR_LENGTH * 3,
    ),
  ],
  [TURN_RIGHT]: [
    getLine(
      -gridWidth - CAR_LENGTH * 3,
      -gridWidth / 2,
      -gridWidth - CAR_LENGTH,
      -gridWidth / 2,
    ),
    getPreTurnRight(),
    getPostTurnRight(),
    getLine(
      -gridWidth / 2,
      -gridWidth - CAR_LENGTH,
      -gridWidth / 2,
      -gridWidth - CAR_LENGTH * 3,
    ),
  ],
  [GO_STRAIGHT]: [
    getLine(
      -gridWidth - CAR_LENGTH * 3,
      -gridWidth / 2,
      -gridWidth - CAR_LENGTH,
      -gridWidth / 2,
    ),
    getLine(
      -gridWidth - CAR_LENGTH,
      -gridWidth / 2,
      -gridWidth / 2,
      -gridWidth / 2,
    ),
    getLine(-gridWidth / 2, -gridWidth / 2, gridWidth / 2, -gridWidth / 2),
    getLine(
      gridWidth / 2,
      -gridWidth / 2,
      gridWidth + CAR_LENGTH,
      -gridWidth / 2,
    ),
    getLine(
      gridWidth + CAR_LENGTH,
      -gridWidth / 2,
      gridWidth + CAR_LENGTH * 3,
      -gridWidth / 2,
    ),
  ],
});
const getPaths = (car, trajectory) => {
  const basePaths = getBasePaths()[trajectory];
  const degree = getRotationZ[car.onLane];
  const rotatedPath = basePaths.map((CatmullRomCurve3) => {
    const newCatmullRomCurve3 = new THREE.CatmullRomCurve3();
    newCatmullRomCurve3.points = CatmullRomCurve3.points.map((point) => {
      const newPoint = new THREE.Vector3();
      newPoint.x = point.x * Math.cos(degree) - point.y * Math.sin(degree);
      newPoint.y = point.x * Math.sin(degree) + point.y * Math.cos(degree);
      newPoint.z = point.z;
      return newPoint;
    });
    return newCatmullRomCurve3;
  });
  return rotatedPath;
};

export {getRoad, getPaths};
