import {ambientLight, dirLight} from './light';
import {camera, cameraWidth, cameraHeight} from './camera';
import {getRoad} from './road';
import {Car} from './car';
window.focus(); // Capture keys right away (by default focus is on editor)

// The Pythagorean theorem says that the distance between two points is
// the square root of the sum of the horizontal and vertical distance's square
function getDistance(coordinate1, coordinate2) {
  const horizontalDistance = coordinate2.x - coordinate1.x;
  const verticalDistance = coordinate2.y - coordinate1.y;
  return Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);
}

const config = {
  showHitZones: false,
  shadows: true, // Use shadow
  trees: true, // Add trees to the map
  curbs: true, // Show texture on the extruded geometry
  grid: false, // Show grid helper
};

let score;
const speed = 0.0017;

const playerAngleInitial = Math.PI;
let playerAngleMoved;

let otherVehicles = [];
let ready;
let lastTimestamp;

const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

const arcAngle1 = (1 / 3) * Math.PI; // 60 degrees

const deltaY = Math.sin(arcAngle1) * innerTrackRadius;
const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

const arcCenterX =
  (Math.cos(arcAngle1) * innerTrackRadius +
    Math.cos(arcAngle2) * outerTrackRadius) /
  2;

const scene = new THREE.Scene();

const playerCar = Car(config);
scene.add(playerCar);

scene.add(getRoad(cameraWidth, cameraHeight * 2)); // The map height is higher because we look at the map from an angle
scene.add(ambientLight);
scene.add(dirLight);
// const cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(cameraHelper);

if (config.grid) {
  const gridHelper = new THREE.GridHelper(80, 8);
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);
}

// Set up renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
if (config.shadows) renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

reset();

function reset() {
  // Reset position and score
  playerAngleMoved = 0;
  score = 0;
  // scoreElement.innerText = "Press UP";

  // Remove other vehicles
  otherVehicles.forEach((vehicle) => {
    // Remove the vehicle from the scene
    scene.remove(vehicle.mesh);

    // If it has hit-zone helpers then remove them as well
    if (vehicle.mesh.userData.hitZone1)
      scene.remove(vehicle.mesh.userData.hitZone1);
    if (vehicle.mesh.userData.hitZone2)
      scene.remove(vehicle.mesh.userData.hitZone2);
    if (vehicle.mesh.userData.hitZone3)
      scene.remove(vehicle.mesh.userData.hitZone3);
  });
  otherVehicles = [];

  // resultsElement.style.display = "none";

  lastTimestamp = undefined;

  // Place the player's car to the starting position
  // movePlayerCar(0);

  // Render the scene
  renderer.render(scene, camera);

  ready = true;
}

function startGame() {
  if (ready) {
    ready = false;
    // scoreElement.innerText = 0;
    // buttonsElement.style.opacity = 1;
    // instructionsElement.style.opacity = 0;
    // youtubeLogo.style.opacity = 1;
    renderer.setAnimationLoop(animation);
  }
}

function animation(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    return;
  }

  const timeDelta = timestamp - lastTimestamp;

  movePlayerCar(timeDelta);

  const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));

  // Update score if it changed
  if (laps != score) {
    score = laps;
    // scoreElement.innerText = score;
  }

  // Add a new vehicle at the beginning and with every 5th lap
  if (otherVehicles.length < (laps + 1) / 5) addVehicle();

  moveOtherVehicles(timeDelta);

  hitDetection();

  renderer.render(scene, camera);
  lastTimestamp = timestamp;
}

function movePlayerCar(timeDelta) {
  const playerSpeed = getPlayerSpeed();
  playerAngleMoved -= playerSpeed * timeDelta;

  const totalPlayerAngle = playerAngleInitial + playerAngleMoved;

  const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX;
  const playerY = Math.sin(totalPlayerAngle) * trackRadius;

  playerCar.position.x = playerX;
  playerCar.position.y = playerY;

  playerCar.rotation.z = totalPlayerAngle - Math.PI / 2;
}

function moveOtherVehicles(timeDelta) {
  otherVehicles.forEach((vehicle) => {
    if (vehicle.clockwise) {
      vehicle.angle -= speed * timeDelta * vehicle.speed;
    } else {
      vehicle.angle += speed * timeDelta * vehicle.speed;
    }

    const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX;
    const vehicleY = Math.sin(vehicle.angle) * trackRadius;
    const rotation =
      vehicle.angle + (vehicle.clockwise ? -Math.PI / 2 : Math.PI / 2);
    vehicle.mesh.position.x = vehicleX;
    vehicle.mesh.position.y = vehicleY;
    vehicle.mesh.rotation.z = rotation;
  });
}

function getPlayerSpeed() {
  return speed;
}

function addVehicle() {
  const vehicleTypes = ['car', 'truck'];

  const type = pickRandom(vehicleTypes);
  const speed = getVehicleSpeed(type);
  const clockwise = Math.random() >= 0.5;

  const angle = clockwise ? Math.PI / 2 : -Math.PI / 2;

  const mesh = type == 'car' ? Car(config) : Truck();
  scene.add(mesh);

  otherVehicles.push({mesh, type, speed, clockwise, angle});
}

function getVehicleSpeed(type) {
  if (type == 'car') {
    const minimumSpeed = 1;
    const maximumSpeed = 2;
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
  }
  if (type == 'truck') {
    const minimumSpeed = 0.6;
    const maximumSpeed = 1.5;
    return minimumSpeed + Math.random() * (maximumSpeed - minimumSpeed);
  }
}

function getHitZonePosition(center, angle, clockwise, distance) {
  const directionAngle = angle + clockwise ? -Math.PI / 2 : +Math.PI / 2;
  return {
    x: center.x + Math.cos(directionAngle) * distance,
    y: center.y + Math.sin(directionAngle) * distance,
  };
}

function hitDetection() {
  const playerHitZone1 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    15,
  );

  const playerHitZone2 = getHitZonePosition(
    playerCar.position,
    playerAngleInitial + playerAngleMoved,
    true,
    -15,
  );

  if (config.showHitZones) {
    playerCar.userData.hitZone1.position.x = playerHitZone1.x;
    playerCar.userData.hitZone1.position.y = playerHitZone1.y;

    playerCar.userData.hitZone2.position.x = playerHitZone2.x;
    playerCar.userData.hitZone2.position.y = playerHitZone2.y;
  }

  const hit = otherVehicles.some((vehicle) => {
    if (vehicle.type == 'car') {
      const vehicleHitZone1 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        15,
      );

      const vehicleHitZone2 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        -15,
      );

      if (config.showHitZones) {
        vehicle.mesh.userData.hitZone1.position.x = vehicleHitZone1.x;
        vehicle.mesh.userData.hitZone1.position.y = vehicleHitZone1.y;

        vehicle.mesh.userData.hitZone2.position.x = vehicleHitZone2.x;
        vehicle.mesh.userData.hitZone2.position.y = vehicleHitZone2.y;
      }

      // The player hits another vehicle
      if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;

      // Another vehicle hits the player
      if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    }

    if (vehicle.type == 'truck') {
      const vehicleHitZone1 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        35,
      );

      const vehicleHitZone2 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        0,
      );

      const vehicleHitZone3 = getHitZonePosition(
        vehicle.mesh.position,
        vehicle.angle,
        vehicle.clockwise,
        -35,
      );

      if (config.showHitZones) {
        vehicle.mesh.userData.hitZone1.position.x = vehicleHitZone1.x;
        vehicle.mesh.userData.hitZone1.position.y = vehicleHitZone1.y;

        vehicle.mesh.userData.hitZone2.position.x = vehicleHitZone2.x;
        vehicle.mesh.userData.hitZone2.position.y = vehicleHitZone2.y;

        vehicle.mesh.userData.hitZone3.position.x = vehicleHitZone3.x;
        vehicle.mesh.userData.hitZone3.position.y = vehicleHitZone3.y;
      }

      // The player hits another vehicle
      if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;
      if (getDistance(playerHitZone1, vehicleHitZone3) < 40) return true;

      // Another vehicle hits the player
      if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
    }
  });

  if (hit) {
    // if (resultsElement) resultsElement.style.display = "flex";
    renderer.setAnimationLoop(null); // Stop animation loop
  }
}

window.addEventListener('resize', () => {
  console.log('resize', window.innerWidth, window.innerHeight);

  // Adjust camera
  const newAspectRatio = window.innerWidth / window.innerHeight;
  const adjustedCameraHeight = cameraWidth / newAspectRatio;

  camera.top = adjustedCameraHeight / 2;
  camera.bottom = adjustedCameraHeight / -2;
  camera.updateProjectionMatrix(); // Must be called after change

  // Reset renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});
