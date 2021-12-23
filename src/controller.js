import {
  LANE_1,
  LANE_2,
  LANE_3,
  LANE_4,
} from './constants';

const move = (car, t, isReversed) => {
  if (!car.paths[car.stage]) return;
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
  const up = new THREE.Vector3(0, 0, 1);
  let angle = -Math.atan(tangent.x / tangent.y);
  if (tangent.y < 0)
    angle += Math.PI;
  car.quaternion.setFromAxisAngle(up, angle+Math.PI/2); 
  
};
export {move};
