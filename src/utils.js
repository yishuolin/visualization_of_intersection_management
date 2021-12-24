import {LANE_1, LANE_2, LANE_3, LANE_4, CAR_LENGTH, nZones} from './constants';

function Stack() {
  const items = [];
  this.push = function (element) {
    items.push(element);
  };
  this.pop = function () {
    return items.pop();
  };
  this.top = function () {
    return items[items.length - 1];
  };
  this.isEmpty = function () {
    return items.length === 0;
  };
  this.clear = function () {
    items = [];
  };
  this.size = function () {
    return items.length;
  };
}

const getRotationZ = {
  [LANE_1]: 0,
  [LANE_2]: Math.PI,
  [LANE_3]: Math.PI * 1.5,
  [LANE_4]: Math.PI / 2,
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const laneAdapter = {
  'lane_-1': LANE_2,
  'lane_-2': LANE_1,
  'lane_-3': LANE_4,
  'lane_-4': LANE_3,
};

const getInitialPosition = {
  [LANE_1]: (car) => ({
    x:
      -window.intersectionArea.width / nZones -
      CAR_LENGTH * (car.order * 2 - 1),
    y: -window.intersectionArea.height / nZones / 2,
  }),
  [LANE_2]: (car) => ({
    x:
      window.intersectionArea.width / nZones + CAR_LENGTH * (car.order * 2 - 1),
    y: window.intersectionArea.height / nZones / 2,
  }),
  [LANE_3]: (car) => ({
    x: -window.intersectionArea.width / nZones / 2,
    y:
      window.intersectionArea.height / nZones +
      CAR_LENGTH * (car.order * 2 - 1),
  }),
  [LANE_4]: (car) => ({
    x: window.intersectionArea.width / nZones / 2,
    y:
      -window.intersectionArea.height / nZones -
      CAR_LENGTH * (car.order * 2 - 1),
  }),
};

export {Stack, getRotationZ, getRandomColor, laneAdapter, getInitialPosition};
