import {
  TRACK_COLOR,
  BARRIER_LINE_COLOR,
  ZONE_LINE_COLOR,
  BARRIER_LINE_WIDTH,
  ZONE_LINE_WIDTH,
  INTERSECTION_AREA_SIZE,
  TURN_LEFT,
  TURN_RIGHT,
  GO_STRAIGHT,
  CAR_LENGTH,
  STUFF_NUM,
  SCENE_WIDTH,
  SCENE_HEIGHT,
} from './constants';
import {getRotationZ, Text} from './utils';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import {ModelManager} from './modelManager';
import {randomStuff} from './randomStuff';

const RADIAN_90 = Math.PI / 2;
const RADIAN_270 = Math.PI * 1.5;
const RADIAN_315 = Math.PI * 1.75;
const RADIAN_360 = Math.PI * 2;

const modelManager = new ModelManager();

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

function getZoneIndices() {
  // TODO: refactor
  const text_00 = new Text('(0, 0)');
  text_00.position.x = -40;
  text_00.position.y = -gridHeight + 25;
  const text_01 = new Text('(0, 1)');
  text_01.position.x = -40;
  text_01.position.y = 25;
  const text_10 = new Text('(1, 0)');
  text_10.position.x = -40 + gridWidth;
  text_10.position.y = -gridHeight + 25;
  const text_11 = new Text('(1, 1)');
  text_11.position.x = -40 + gridWidth;
  text_11.position.y = 25;
  return [text_00, text_01, text_10, text_11];
}

function getRoad(mapWidth, mapHeight, nZones) {
  const road = new THREE.Group();
  const lineMarkingsTexture = getLineMarkings(
    mapWidth,
    mapHeight,
    INTERSECTION_AREA_SIZE,
    nZones,
  );

  const planeGeometry = new THREE.PlaneBufferGeometry(
    SCENE_WIDTH,
    SCENE_HEIGHT,
  );
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: lineMarkingsTexture,
  });

  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.matrixAutoUpdate = false;
  road.add(plane);

  const blocks = getBlocks(2000);
  road.add(blocks);

  getZoneIndices().forEach((index) => {
    road.add(index);
  });

  return road;
}

function getLineMarkings(mapWidth, mapHeight, intersectionAreaSize, nZones) {
  const intersectionArea = {
    width: mapWidth * intersectionAreaSize,
    height: mapHeight * intersectionAreaSize,
  };
  const intersectionAreaStart = {
    x: SCENE_WIDTH / 2 - intersectionArea.width / 2,
    y: SCENE_HEIGHT / 2 - intersectionArea.height / 2,
  };
  const intersectionAreaEnd = {
    x: SCENE_WIDTH / 2 + intersectionArea.width / 2,
    y: SCENE_HEIGHT / 2 + intersectionArea.height / 2,
  };
  const canvas = document.createElement('canvas');
  canvas.width = SCENE_WIDTH;
  canvas.height = SCENE_HEIGHT;
  const context = canvas.getContext('2d');

  context.fillStyle = TRACK_COLOR;
  context.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  context.lineWidth = BARRIER_LINE_WIDTH;
  context.strokeStyle = BARRIER_LINE_COLOR;
  context.setLineDash([10, 14]);

  // vertical line
  context.beginPath();
  context.moveTo(SCENE_WIDTH / 2, 0);
  context.lineTo(SCENE_WIDTH / 2, intersectionAreaStart.y);
  context.moveTo(SCENE_WIDTH / 2, intersectionAreaEnd.y);
  context.lineTo(SCENE_WIDTH / 2, SCENE_HEIGHT);
  context.stroke();

  // horizontal line
  context.beginPath();
  context.moveTo(0, SCENE_HEIGHT / 2);
  context.lineTo(intersectionAreaStart.x, SCENE_HEIGHT / 2);
  context.moveTo(intersectionAreaEnd.x, SCENE_HEIGHT / 2);
  context.lineTo(SCENE_WIDTH, SCENE_HEIGHT / 2);
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

function getBlocks() {
  const blocks = new THREE.Group();
  const blockSizeW = SCENE_WIDTH / 2 - gridWidth;
  const blockSizeH = SCENE_HEIGHT / 2 - gridHeight;
  for (let index = 0; index < 4; index++) {
    let block = new THREE.Group();
    let geometry = new RoundedBoxGeometry(blockSizeW, blockSizeH, 100, 5, 100);
    let material = new THREE.MeshLambertMaterial({color: 0x00cc00});
    block.add(new THREE.Mesh(geometry, material));
    let stuffs = randomStuff(
      blockSizeW * 0.9,
      blockSizeH * 0.9,
      block,
      STUFF_NUM,
    );
    stuffs.forEach((stuff) => modelManager.add(...stuff));
    switch (index) {
      case 0:
        block.position.set(
          -gridWidth - blockSizeW / 2,
          gridHeight + blockSizeH / 2,
          -20,
        );
        break;
      case 1:
        block.position.set(
          gridWidth + blockSizeW / 2,
          gridHeight + blockSizeH / 2,
          -20,
        );
        break;
      case 2:
        block.position.set(
          -gridWidth - blockSizeW / 2,
          -gridHeight - blockSizeH / 2,
          -20,
        );
        break;
      case 3:
        block.position.set(
          gridWidth + blockSizeW / 2,
          -gridHeight - blockSizeH / 2,
          -20,
        );
        break;
    }
    blocks.add(block);
  }
  modelManager.load();
  return blocks;
}

const getPreTurnLeft = () => {
  return new THREE.CatmullRomCurve3([
    ...getLine(-gridWidth / 2, -gridWidth / 2, 0, -gridWidth / 2).getPoints(),
    ...getCircle(0, 0, gridWidth / 2, RADIAN_270, RADIAN_315).getPoints(),
  ]);
};
const getPostTurnLeft = () => {
  return new THREE.CatmullRomCurve3([
    ...getCircle(0, 0, gridWidth / 2, RADIAN_315, RADIAN_360).getPoints(),
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

const getInitialPath = (order) => {
  let paths = [];
  for (let i = 2; i <= order; i++) {
    paths.unshift(
      getLine(
        -gridWidth - CAR_LENGTH * (i * 2 - 1),
        -gridWidth / 2,
        -gridWidth - CAR_LENGTH * (i * 2 - 3),
        -gridWidth / 2,
      ),
    );
  }
  return paths;
};

const getBasePaths = (order) => ({
  [TURN_LEFT]: [
    ...getInitialPath(order),
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
    ...getInitialPath(order),
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
    ...getInitialPath(order),
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

const getPaths = (car, trajectory, order) => {
  const basePaths = getBasePaths(order)[trajectory];
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
