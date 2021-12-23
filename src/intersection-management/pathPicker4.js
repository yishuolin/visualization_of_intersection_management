export default function (nCars, maxLaneCars) {
  const laneSize = 4;
  if (maxLaneCars * laneSize < nCars)
    throw new Error('maxLaneCars * laneSize > nCars');
  const mapLaneName = (laneId) => `lane_${laneId+1}`;  
  const mapDirectionName = (directionId) => (directionId) == 0 ? 'turn_left'  : 
                                            (directionId) == 1 ? 'turn_right' : 'go_straight';  
  const mapTargetLaneName = (sourceLaneName, directionName) => {
    switch (sourceLaneName) {
      case 'lane_1':
        switch (directionName) {
          case 'turn_left':
            return 'lane_-3';
          case 'turn_right':
            return 'lane_-4';
          case 'go_straight':
            return 'lane_-2';
        }
      case 'lane_2':
        switch (directionName) {
          case 'turn_left':
            return 'lane_-4';
          case 'turn_right':
            return 'lane_-3';
          case 'go_straight':
            return 'lane_-1';
        }
      case 'lane_3':
        switch (directionName) {
          case 'turn_left':
            return 'lane_-2';
          case 'turn_right':
            return 'lane_-1';
          case 'go_straight':
            return 'lane_-4';
        }
      case 'lane_4':
        switch (directionName) {
          case 'turn_left':
            return 'lane_-1';
          case 'turn_right':
            return 'lane_-2';
          case 'go_straight':
            return 'lane_-3';
        }
      default:
        throw new Error('sourceLaneId not found');
    }
  }
  let path = {};
  let laneCars = {};
  for (let index = 0; index < laneSize; index++)
    laneCars[index] = 0;
  
  for (let index = 0; index < nCars; index++) {
    let lane = Math.floor(Math.random() * laneSize);
    while (laneCars[lane] >= maxLaneCars)
      lane = (lane + 1) % 4;
    let order = ++laneCars[lane];
    let direction = Math.floor(Math.random() * 3);
    path[index] = { 
      lane: mapLaneName(lane),
      order: order,
      direction: mapDirectionName(direction),
      targetLane: mapTargetLaneName(mapLaneName(lane), mapDirectionName(direction))
    };
  }

  return path;
}