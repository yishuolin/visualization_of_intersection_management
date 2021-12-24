import {
  CAR_HEIGHT,
  CAR_LENGTH,
  LANE_1,
  LANE_2,
  LANE_3,
  LANE_4,
} from './constants';

const getNewPoint = (car, lastPoint) => {
  const laneSwitch = {
    [LANE_1]: new THREE.Vector3(
      lastPoint.x + CAR_LENGTH,
      lastPoint.y,
      lastPoint.z,
    ),
    [LANE_2]: new THREE.Vector3(
      lastPoint.x - CAR_LENGTH,
      lastPoint.y,
      lastPoint.z,
    ),
    [LANE_3]: new THREE.Vector3(
      lastPoint.x,
      lastPoint.y - CAR_LENGTH,
      lastPoint.z,
    ),
    [LANE_4]: new THREE.Vector3(
      lastPoint.x,
      lastPoint.y + CAR_LENGTH,
      lastPoint.z,
    ),
  };
  return laneSwitch[car.targetLane];
};
const move = (car, t, isReversed) => {
  if (!car.paths[car.stage]) {
    const lastPath = car.paths[car.stage - 1];
    const lastPoint = lastPath.getPointAt(1);
    const newPath = new THREE.CatmullRomCurve3([
      lastPoint,
      getNewPoint(car, lastPoint),
    ]);
    car.paths[car.stage] = newPath;
  }
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
  if (tangent.y < 0) angle += Math.PI;
  if (isReversed) angle += Math.PI;
  car.quaternion.setFromAxisAngle(up, angle + Math.PI / 2);
};
export {move};
