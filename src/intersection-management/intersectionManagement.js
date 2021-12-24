import cytoscape from 'cytoscape';
import cycss from './cycss.txt';
import d3Force from 'cytoscape-d3-force';
import pathPicker4 from './pathPicker4.js';
import conflictZonePath4 from './conflictZonePath4.js';
cytoscape.use( d3Force );

export default class {
  constructor() {
    this.maxLeaveOrder = 5;
    this.nCars = undefined;
    this.maxLaneCars = undefined;
    this.carPaths = undefined;
    this.laneSize = undefined;
    this.timingConflictGraph = cytoscape({
        container: document.getElementById('cy'),
        wheelSensitivity: 0.1,
        style: cycss
    });
    this.timingConflictGraph.style().selector('node').style('label', (node) => {
      let [car, type, xy] = node.data('id').split(':');
      let str = `car: ${car}\n`;
      if (type == "l") {
        let [x, y] = xy.substr(1, xy.length-2).split(',');
        str += `lane: ${x.split('_')[1]}\n`;
        str += `order: ${y}`;
      }
      else {
        str += `zone: ${xy}`;
      }
      console.log(node.data('id').split(':'));
      return str;
    }).update();
  }
  
  _layoutGraph() {
    this.timingConflictGraph.elements(':visible').layout({
        name: 'd3-force',
        linkId: function id(d) { return d.id; },
        collideRadius: 50,
        collideStrength: 1,
        manyBodyStrength: -300,
        linkDistance: 100,
        infinite: true
    }).run();
  }

  randomGraph(nCars = 6, maxLaneCars = 3) {
    this.timingConflictGraph.elements().remove();
    this.nCars = nCars;
    this.maxLaneCars = maxLaneCars;
    // TODO: different lane size
    this.laneSize = 4;
    this.carPaths = pathPicker4(nCars, maxLaneCars);
    // TODOEND: different lane size
    this._generateGraph();
    this._layoutGraph();
  }
  
  userGraph(yaml) {
    this.timingConflictGraph.elements().remove();
    // TODO: parse yaml to get nCars, maxLaneCars, carPaths
    this._generateGraph();
    this._layoutGraph();
  }

  _generateGraph() {
    // generate nodes and type-1 edges
    let tempLane = {};
    let tempZone = {};
    let addLaneData = (lane, order, data) => {
      if (tempLane[lane] == undefined)
        tempLane[lane] = {};
      if (tempLane[lane][order] == undefined)
        tempLane[lane][order] = [];
      tempLane[lane][order].push(data);
    }
    let addZoneData = (zoneX, ZoneY, data) => {
      if (tempZone[zoneX] == undefined)
        tempZone[zoneX] = {};
      if (tempZone[zoneX][ZoneY] == undefined)
        tempZone[zoneX][ZoneY] = [];
      tempZone[zoneX][ZoneY].push(data);
    }
    
    for (const [car, path] of Object.entries(this.carPaths)) {
      // source lane path
      for (let order = path.order; order > 0; order--) {
        this.timingConflictGraph.add({
          group: 'nodes',
          data: {
            id: `${car}:l:[${path.lane},${order}]`,
            car: car,
            inLane: true,
            position: [path.lane, order]
          }
        })
        addLaneData(path.lane, order, {car: car, lane: path.lane});
      }
      for (let order = path.order; order > 1; order--) {
        this.timingConflictGraph.add({
          group: 'edges',
          data: {
            id: `${car}:l:[${path.lane},${order}]_${car}:l:[${path.lane},${order-1}]`,
            source: `${car}:l:[${path.lane},${order}]`,
            target: `${car}:l:[${path.lane},${order-1}]`,
            inLane: true,
            type: 1
          },
          classes: 'cy-edge-type1'
        })
      }

      // conflict zone path
      for (let index = 0; index < conflictZonePath4[path.lane][path.direction].length; index++) {
        const currentZone = conflictZonePath4[path.lane][path.direction][index];
        
        this.timingConflictGraph.add({
          group: 'nodes',
          data: {
            id: `${car}:c:[${currentZone[0]},${currentZone[1]}]`,
            car: car,
            inLane: false,
            position: currentZone
          }
        })
        addZoneData(currentZone[0], currentZone[1], {car: car, lane: path.lane});
      }
      for (let index = 0; index < conflictZonePath4[path.lane][path.direction].length-1; index++) {
        const currentZone = conflictZonePath4[path.lane][path.direction][index];
        const nextZone = conflictZonePath4[path.lane][path.direction][index+1];

        this.timingConflictGraph.add({
          group: 'edges',
          data: {
            id: `${car}:c:[${currentZone[0]},${currentZone[1]}]_${car}:c:[${nextZone[0]},${nextZone[1]}]`,
            source: `${car}:c:[${currentZone[0]},${currentZone[1]}]`,
            target: `${car}:c:[${nextZone[0]},${nextZone[1]}]`,
            inLane: false,
            type: 1
          },
          classes: 'cy-edge-type1'
        })
      }

      // target lane path
      for (let order = 1; order <= this.maxLeaveOrder; order++) {
        this.timingConflictGraph.add({
          group: 'nodes',
          data: {
            id: `${car}:l:[${path.targetLane},${order}]`,
            car: car,
            inLane: true,
            position: [path.targetLane, order]
          }
        })
        
        addLaneData(path.targetLane, order, {car: car, lane: path.lane});
      }
      
      for (let order = 1; order <= this.maxLeaveOrder-1; order++) {
        this.timingConflictGraph.add({
          group: 'edges',
          data: {
            id: `${car}:l:[${path.targetLane},${order}]_${car}:l:[${path.targetLane},${order+1}]`,
            source: `${car}:l:[${path.targetLane},${order}]`,
            target: `${car}:l:[${path.targetLane},${order+1}]`,
            inLane: true,
            type: 1
          },
          classes: 'cy-edge-type1'
        })
      }

      // source lane to conflict zone edge
      let firstZone = conflictZonePath4[path.lane][path.direction][0];
      this.timingConflictGraph.add({
        group: 'edges',
        data: {
          id: `${car}:l:[${path.lane},1]_${car}:c:[${firstZone[0]},${firstZone[1]}]`,
          source: `${car}:l:[${path.lane},1]`,
          target: `${car}:c:[${firstZone[0]},${firstZone[1]}]`,
          inLane: true,
          type: 1
        },
        classes: 'cy-edge-type1'
      })
      
      // conflict zone to target lane edge
      let lastZone = conflictZonePath4[path.lane][path.direction][conflictZonePath4[path.lane][path.direction].length-1];
      this.timingConflictGraph.add({
        group: 'edges',
          data: {
            id: `${car}:c:[${lastZone[0]},${lastZone[1]}]_${car}:l:[${path.targetLane},1]`,
            source: `${car}:c:[${lastZone[0]},${lastZone[1]}]`,
            target: `${car}:l:[${path.targetLane},1]`,
            inLane: true,
            type: 1
          },
          classes: 'cy-edge-type1'
      })
    }
    
    // generate type-2 edges
    // lanes
    for (const [lane, orders] of Object.entries(tempLane)) {
      for (const [order, cars] of Object.entries(orders)) {
        let sortedcars = cars.sort( (a, b) => a.car > b.car );
        
        for (let index = 0; index < sortedcars.length; index++) {
          for (let index2 = index+1; index2 < sortedcars.length; index2++) {
            const car = sortedcars[index];
            const nextCar = sortedcars[index2];
            if (car.lane == nextCar.lane) {
              this.timingConflictGraph.add({
                group: 'edges',
                data: {
                  id: `${car.car}:l:[${lane},${order}]_${nextCar.car}:l:[${lane},${order}]`,
                  source: `${car.car}:l:[${lane},${order}]`,
                  target: `${nextCar.car}:l:[${lane},${order}]`,
                  inLane: true,
                  type: 2
                },
                classes: 'cy-edge-type2'
              })
            }
          }
        }
      }
    }
    // conflict zones
    for (const [zoneX, zoneYs] of Object.entries(tempZone)) {
      for (const [zoneY, cars] of Object.entries(zoneYs)) {
        let sortedcars = cars.sort( (a, b) => a.car > b.car );
        for (let index = 0; index < sortedcars.length; index++) {
          for (let index2 = index+1; index2 < sortedcars.length; index2++) {
            const car = sortedcars[index];
            const nextCar = sortedcars[index2];
            if (car.lane == nextCar.lane) {
              this.timingConflictGraph.add({
                group: 'edges',
                data: {
                  id: `${car.car}:c:[${zoneX},${zoneY}]_${nextCar.car}:c:[${zoneX},${zoneY}]`,
                  source: `${car.car}:c:[${zoneX},${zoneY}]`,
                  target: `${nextCar.car}:c:[${zoneX},${zoneY}]`,
                  inLane: false,
                  type: 2
                },
                classes: 'cy-edge-type2'
              })
            }
            else {
              this.timingConflictGraph.add({
                group: 'edges',
                data: {
                  id: `${nextCar.car}:c:[${zoneX},${zoneY}]_${car.car}:c:[${zoneX},${zoneY}]`,
                  source: `${nextCar.car}:c:[${zoneX},${zoneY}]`,
                  target: `${car.car}:c:[${zoneX},${zoneY}]`,
                  inLane: false,
                  type: 3
                },
                classes: 'cy-edge-type3'
              })
              this.timingConflictGraph.add({
                group: 'edges',
                data: {
                  id: `${car.car}:c:[${zoneX},${zoneY}]_${nextCar.car}:c:[${zoneX},${zoneY}]`,
                  source: `${car.car}:c:[${zoneX},${zoneY}]`,
                  target: `${nextCar.car}:c:[${zoneX},${zoneY}]`,
                  inLane: false,
                  type: 3
                },
                classes: 'cy-edge-type3'
              })
            }
          }
        }
      }
    }
  }
  showOnlyZones() {
    this.timingConflictGraph.elements('[?inLane]').style('visibility', 'hidden');
    this._layoutGraph();
  }
  showFull() {
    this.timingConflictGraph.elements('[?inLane]').style('visibility', 'visible');
    this._layoutGraph();
  }

}