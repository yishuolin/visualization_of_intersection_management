function Car(config) {
  const car = new THREE.Group();

  const color = 0xa52523;

  const main = new THREE.Mesh(
    new THREE.BoxBufferGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({color}),
  );
  main.position.z = 12;
  main.castShadow = true;
  main.receiveShadow = true;
  car.add(main);

  if (config.showHitZones) {
    // TODO: HitZone is nod defined
    car.userData.hitZone1 = HitZone();
    car.userData.hitZone2 = HitZone();
  }

  car.zones = [
    {x: 0, y: 0},
    {x: 0, y: 0},
    {x: 0, y: 0},
    {x: 1, y: 0},
    {x: 1, y: 0},
    {x: 1, y: 1},
    {x: 1, y: 1},
  ];
  car.currentPosition = {x: -150, y: -130, z: 0};
  car.nextPosition = {x: 100, y: -150, z: 0};
  car.currentRotation = {x: 0, y: 0, z: 0};
  car.nextRotation = {x: 0, y: 0, z: 0};
  car.onLane = 1;
  car.prevTrajectory = 'right';
  // turn
  car.startTurnLeft = 0;
  car.radius = 0;
  car.hasTurned = false;
  return car;
}

export {Car};
