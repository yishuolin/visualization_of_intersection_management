const TRACK_COLOR = '#546E90';
const LINE_WIDTH = 2;
const INTERSECTION_AREA_SIZE = 0.5;

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
    x: mapWidth - intersectionArea.width / 2,
    y: mapHeight - intersectionArea.height / 2,
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
  context.lineWidth = LINE_WIDTH;
  context.strokeStyle = '#000000';
  context.setLineDash([]);
  const gridWidth = intersectionArea.width / nZones;
  const gridHeight = intersectionArea.height / nZones;

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

export {getRoad};
