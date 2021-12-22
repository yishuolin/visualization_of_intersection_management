const move = (car, t, isReversed) => {
  const path = isReversed
    ? new THREE.CatmullRomCurve3([
        ...car.paths[car.stage - 1].getPoints().reverse(), // TODO: -1 might encounter edge cases
      ])
    : car.paths[car.stage];

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
