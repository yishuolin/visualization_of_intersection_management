import {LANE_1, LANE_2, LANE_3, LANE_4} from './constants';

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

export {Stack, getRotationZ, getRandomColor};
