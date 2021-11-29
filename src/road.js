const TRACK_COLOR = '#546E90';
const LINE_WIDTH = 2;
const INTERSECTION_AREA_SIZE = 0.5;

function getRoad(mapWidth, mapHeight) {
  const lineMarkingsTexture = getLineMarkings(
    mapWidth,
    mapHeight,
    INTERSECTION_AREA_SIZE,
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

function getLineMarkings(mapWidth, mapHeight, intersectionAreaSize) {
  const intersectionArea = {
    width: mapWidth * intersectionAreaSize,
    height: mapHeight * intersectionAreaSize,
  };
  const canvas = document.createElement('canvas');
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext('2d');

  context.fillStyle = TRACK_COLOR;
  context.fillRect(0, 0, mapWidth, mapHeight);

  context.lineWidth = LINE_WIDTH;
  context.strokeStyle = '#E0FFFF';
  context.setLineDash([10, 14]);

  // vertical line
  context.beginPath();
  context.moveTo(mapWidth / 2, 0);
  context.lineTo(mapWidth / 2, mapHeight / 2 - intersectionArea.height / 2);
  context.moveTo(mapWidth / 2, mapHeight - intersectionArea.height / 2);
  context.lineTo(mapWidth / 2, mapHeight);
  context.stroke();

  // horizontal line
  context.beginPath();
  context.moveTo(0, mapHeight / 2);
  context.lineTo(mapWidth / 2 - intersectionArea.width / 2, mapHeight / 2);
  context.moveTo(mapWidth - intersectionArea.width / 2, mapHeight / 2);
  context.lineTo(mapWidth, mapHeight / 2);
  context.stroke();

  return new THREE.CanvasTexture(canvas);
}

export {getRoad};
