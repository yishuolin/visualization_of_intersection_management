import {
  LANE_1,
  LANE_2,
  LANE_3,
  LANE_4,
} from './constants';

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
  let angle = (tangent.y < 0.1 && tangent.y > -0.1) ? -Math.PI/2 : -Math.atan(tangent.x / tangent.y);
  const up = new THREE.Vector3(0, 0, 1);
  if (car.onLane == LANE_2 || car.onLane == LANE_3)
      angle += Math.PI;
  car.quaternion.setFromAxisAngle(up, angle + Math.PI/2); 
  
};
export {move};
