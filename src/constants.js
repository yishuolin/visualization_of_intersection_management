const nZones = 2; // form nZones * nZones grid
const FRAME_TIME = 1000;
const ANIMATION_TIME = 5000;
const FPS = 60;

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
const INTERSECTION_AREA_SIZE = 0.2;
const LANE_1 = 'lane_1';
const LANE_2 = 'lane_2';
const LANE_3 = 'lane_3';
const LANE_4 = 'lane_4';

// car
const CAR_WIDTH = 30;
const CAR_LENGTH = 60;
const CAR_HEIGHT = 15;

// path
const TURN_LEFT = 'turn_left';
const TURN_RIGHT = 'turn_right';
const GO_STRAIGHT = 'go_straight';

// simulation
const MAX_PREV_STEPS = 500; // TODO: drop the contraint or add the contraint to visualization

export {
  nZones,
  FRAME_TIME,
  ANIMATION_TIME,
  FPS,
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
  LANE_1,
  LANE_2,
  LANE_3,
  LANE_4,
  CAR_HEIGHT,
  CAR_WIDTH,
  CAR_LENGTH,
  TURN_LEFT,
  TURN_RIGHT,
  GO_STRAIGHT,
  MAX_PREV_STEPS,
};
