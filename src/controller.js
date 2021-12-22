const move = (car, t) => {
  const path = car.paths[car.stage];

  // position
  const position = path.getPointAt(t);
  car.position.copy(position);

  // rotation
  const tangent = path.getTangentAt(t).normalize();
  const angle = -Math.atan(tangent.x / tangent.y);
  const up = new THREE.Vector3(0, 0, 1);
  car.quaternion.setFromAxisAngle(up, angle + Math.PI / 2);
};
export {move};
