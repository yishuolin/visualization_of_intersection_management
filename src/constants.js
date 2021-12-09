const nZones = 2; // form nZones * nZones grid
const FRAME_TIME = 1000;
const ANIMATION_TIME = 5000;

// controller
const START = 'start';
const END = 'end';
const LEFT = 'left';
const RIGHT = 'right';
const UP = 'up';
const DOWN = 'down';

// road
const TRACK_COLOR = '#546E90';
const BARRIER_LINE_COLOR = '#ffff00';
const ZONE_LINE_COLOR = '#000000';
const BARRIER_LINE_WIDTH = 5;
const ZONE_LINE_WIDTH = 1;
const INTERSECTION_AREA_SIZE = 0.5;

export {
  nZones,
  FRAME_TIME,
  ANIMATION_TIME,
  START,
  END,
  LEFT,
  RIGHT,
  UP,
  DOWN,
  TRACK_COLOR,
  BARRIER_LINE_COLOR,
  ZONE_LINE_COLOR,
  BARRIER_LINE_WIDTH,
  ZONE_LINE_WIDTH,
  INTERSECTION_AREA_SIZE,
};
