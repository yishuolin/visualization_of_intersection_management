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

  const windowColor = 0xffffff;
  const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(33, 24, 12), [
    new THREE.MeshLambertMaterial({color: windowColor}),
    new THREE.MeshLambertMaterial({color: windowColor}),
    new THREE.MeshLambertMaterial({color: windowColor}),
    new THREE.MeshLambertMaterial({color: windowColor}),
    new THREE.MeshLambertMaterial({color: 0xffffff}), // top
    new THREE.MeshLambertMaterial({color: 0xffffff}), // bottom
  ]);
  cabin.position.x = -6;
  cabin.position.z = 25.5;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  const backWheel = new Wheel();
  backWheel.position.x = -18;
  car.add(backWheel);

  const frontWheel = new Wheel();
  frontWheel.position.x = 18;
  car.add(frontWheel);

  if (config.showHitZones) {
    car.userData.hitZone1 = HitZone();
    car.userData.hitZone2 = HitZone();
  }

  return car;
}

function Wheel() {
  const wheelGeometry = new THREE.BoxBufferGeometry(12, 33, 12);
  const wheelMaterial = new THREE.MeshLambertMaterial({color: 0x333333});
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.position.z = 6;
  wheel.castShadow = false;
  wheel.receiveShadow = false;
  return wheel;
}

export {Car};
