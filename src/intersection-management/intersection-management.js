import cytoscape from 'cytoscape';
import cycss from './cycss.txt';
import d3Force from 'cytoscape-d3-force';
cytoscape.use( d3Force );

export default class {
    constructor() {
        this.nCars = undefined;
        this.maxLaneCars = undefined;
        this.carPaths = {};
        this.timingConflictGraph = cytoscape({
            container: document.getElementById('cy'),
            wheelSensitivity: 0.1,
            style: cycss
        });
        this.timingConflictGraph.style().selector('node').style('label', (node) => node.data('id')).update();
    }
    _layoutGraph(){
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
    _pathGenerator(sourceLane, targetLane, inLaneOrder) {
        let sourceLanePath = [...Array(inLaneOrder + 1).keys()].reverse().map((x) => [sourceLane, x]);
        let conflictZonePath = [];
        let targetLanePath = [...Array(this.maxLaneCars).keys()].map((x) => [targetLane, x]);;

        let position;
        let UP, DOWN, LEFT, RIGHT;
        switch (sourceLane) {
            case 1:
                position = [0, -1];
                UP = [0, 1];
                DOWN = [0, -1];
                LEFT = [1, 0];
                RIGHT = [-1, 0];
                break;
            case 2:
                position = [-1, 1];
                UP = [1, 0];
                DOWN = [-1, 0];
                LEFT = [0, -1];
                RIGHT = [0, 1];
                break;
            case 3:
                position = [1, 2];
                UP = [0, -1];
                DOWN = [0, 1];
                LEFT = [-1, 0];
                RIGHT = [1, 0];
                break;
            case 4:
                position = [2, 0];
                UP = [-1, 0];
                DOWN = [1, 0];
                LEFT = [0, 1];
                RIGHT = [0, -1];
                break;
        }

        let directions = [];
        switch (Math.abs(sourceLane + targetLane)) {
            case 0:
                // turn around
                directions = [UP, LEFT];
            case 1:
                // turn right
                directions = [UP];
                break;
            case 2:
                // turn left
                directions = [UP, UP, LEFT];
                break;
            case 3:
                // go straight
                directions = [UP, UP];
                break;
            default:
                break;
        }

        for (let index = 0; index < directions.length; index++) {
            position[0] += directions[index][0];
            position[1] += directions[index][1];
            conflictZonePath.push([...position]);
        }
        return {
            sourceLane: sourceLane,
            targetLane: targetLane,
            sourceLanePath: sourceLanePath,
            conflictZonePath: conflictZonePath,
            targetLanePath: targetLanePath,
        };
    }
    _generateGraph() {
        // generate timing conflict graph
        // type 1:
        let edgeIndex = 0;
        for (const [car, carPath] of Object.entries(this.carPaths)) {
            let sourceLanePath = carPath['sourceLanePath'];
            let conflictZonePath = carPath['conflictZonePath'];
            let targetLanePath = carPath['targetLanePath'];

            
            for (let index = 0; index < sourceLanePath.length; index++) {
                let node = {
                    group: 'nodes',
                    data: {
                        id: `${car}:${sourceLanePath[index].join('_')}:l`,
                        car: car,
                        position: sourceLanePath[index],
                        inLane: true
                    }
                }
                this.timingConflictGraph.add(node);
            }
            for (let index = 0; index < sourceLanePath.length - 1; index++) {
                let edge = {
                    group: 'edges',
                    data: {
                        id: `e${edgeIndex++}`,
                        source: `${car}:${sourceLanePath[index].join('_')}:l`,
                        target: `${car}:${sourceLanePath[index + 1].join('_')}:l`,
                        inLane: true,
                        type: 1,
                    },
                    classes: ['cy-edge-type1']
                }
                this.timingConflictGraph.add(edge);
            }

            for (let index = 0; index < conflictZonePath.length; index++) {
                let node = {
                    group: 'nodes',
                    data: {
                        id: `${car}:${conflictZonePath[index].join('_')}:c`,
                        car: car,
                        position: conflictZonePath[index],
                        inLane: false
                    }
                }
                this.timingConflictGraph.add(node);
            }
            for (let index = 0; index < conflictZonePath.length - 1; index++) {
                let edge = {
                    group: 'edges',
                    data: {
                        id: `e${edgeIndex++}`,
                        source: `${car}:${conflictZonePath[index].join('_')}:c`,
                        target: `${car}:${conflictZonePath[index + 1].join('_')}:c`,
                        inLane: false,
                        type: 1
                    },
                    classes: ['cy-edge-type1']
                }
                this.timingConflictGraph.add(edge);
            }

            for (let index = 0; index < targetLanePath.length; index++) {
                let node = {
                    group: 'nodes',
                    data: {
                        id: `${car}:${targetLanePath[index].join('_')}:l`,
                        car: car,
                        position: targetLanePath[index],
                        inLane: true
                    }
                }
                this.timingConflictGraph.add(node);
            }
            for (let index = 0; index < targetLanePath.length - 1; index++) {
                let edge = {
                    group: 'edges',
                    data: {
                        id: `e${edgeIndex++}`,
                        source: `${car}:${targetLanePath[index].join('_')}:l`,
                        target: `${car}:${targetLanePath[index + 1].join('_')}:l`,
                        inLane: true,
                        type: 1
                    },
                    classes: ['cy-edge-type1']
                }
                this.timingConflictGraph.add(edge);
            }
            this.timingConflictGraph.add([
                {
                    group: 'edges',
                    data: {
                        id: `e${edgeIndex++}`,
                        source: `${car}:${sourceLanePath[sourceLanePath.length - 1].join('_')}:l`,
                        target: `${car}:${conflictZonePath[0].join('_')}:c`,
                        inLane: true,
                        type: 1
                    },
                    classes: ['cy-edge-type1']
                },
                {
                    group: 'edges',
                    data: {
                        id: `e${edgeIndex++}`,
                        source: `${car}:${conflictZonePath[conflictZonePath.length - 1].join('_')}:c`,
                        target: `${car}:${targetLanePath[0].join('_')}:l`,
                        inLane: true,
                        type: 1
                    },
                    classes: ['cy-edge-type1']
                }]);
        }

        // type 2
        // iterate through every lane, zone
        for (let lane = 1; lane <= 4; lane++) {
            for (let order = 0; order < this.maxLaneCars; order++) {
                let nodes = this.timingConflictGraph.nodes().filter((node) => node.data('position')[0] == lane && node.data('position')[1] == order && node.data('inLane') == true);
                let nodes_sort = nodes.sort((a, b) => a.data('car') - b.data('car'));
                for (let i = 0; i < nodes_sort.length - 1; i++) {
                    for (let j = i + 1; j < nodes_sort.length; j++) {
                        this.timingConflictGraph.add([
                            { group: 'edges', data: { id: `e${edgeIndex++}`, source: `${nodes_sort[i].data('id')}`, target: `${nodes_sort[j].data('id')}`, inLane: true, type: 2 }, classes: ['cy-edge-type2'] }
                        ]);
                    }
                }
            }
        }

        for (let zoneX = 0; zoneX < 2; zoneX++) {
            for (let zoneY = 0; zoneY < 2; zoneY++) {
                let nodes = this.timingConflictGraph.nodes().filter((node) => node.data('position')[0] == zoneX && node.data('position')[1] == zoneY && node.data('inLane') == false);
                let nodes_sort = nodes.sort((a, b) => a.data('car') - b.data('car'));
                for (let i = 0; i < nodes_sort.length - 1; i++) {
                    for (let j = i + 1; j < nodes_sort.length; j++) {
                        if (this.carPaths[nodes_sort[i].data('car')].sourceLane == this.carPaths[nodes_sort[j].data('car')].sourceLane) {
                            // type 2
                            this.timingConflictGraph.add([
                                { group: 'edges', data: { id: `e${edgeIndex++}`, source: `${nodes_sort[i].data('id')}`, target: `${nodes_sort[j].data('id')}`, inLane: false, type: 2 }, classes: ['cy-edge-type2'] }
                            ]);
                        }
                        else {
                            // type 3
                            this.timingConflictGraph.add([
                                { group: 'edges', data: { id: `e${edgeIndex++}`, source: `${nodes_sort[i].data('id')}`, target: `${nodes_sort[j].data('id')}`, inLane: false, type: 3 }, classes: ['cy-edge-type3'] }
                            ]);
                            this.timingConflictGraph.add([
                                { group: 'edges', data: { id: `e${edgeIndex++}`, source: `${nodes_sort[j].data('id')}`, target: `${nodes_sort[i].data('id')}`, inLane: false, type: 3 }, classes:['cy-edge-type3'] }
                            ]);
                        }
                    }
                }
            }
        }

        for (let lane = -1; lane >= -4; lane--) {
            for (let order = 0; order < this.maxLaneCars; order++) {
                let nodes = this.timingConflictGraph.nodes().filter((node) => node.data('position')[0] == lane && node.data('position')[1] == order && node.data('inLane') == true);
                let nodes_sort = nodes.sort((a, b) => a.data('car') - b.data('car'));
                for (let i = 0; i < nodes_sort.length - 1; i++) {
                    for (let j = i + 1; j < nodes_sort.length; j++) {
                        this.timingConflictGraph.add([
                            { group: 'edges', data: { id: `e${edgeIndex++}`, source: `${nodes_sort[i].data('id')}`, target: `${nodes_sort[j].data('id')}`, inLane: true, type: 2 }, classes: ['cy-edge-type2'] }
                        ]);
                    }
                }
            }
        }
    }
    randomCars(nCars=6, maxLaneCars = 2) {
        this.timingConflictGraph.elements().remove();
        this.nCars = nCars;
        this.maxLaneCars = maxLaneCars;
        this.carPaths = {};

        let laneCars = {
            1: [],
            2: [],
            3: [],
            4: []
        };
        let laneOrder;
        for (let index = 0; index < nCars; index++) {
            let carId = index;
            let sourceLane = Math.floor(Math.random() * 4) + 1;
            let targetLane = -(Math.floor(Math.random() * 4) + 1);
            if (laneCars[sourceLane].length < maxLaneCars) {
                laneOrder = laneCars[sourceLane].length;
                laneCars[sourceLane].push(carId);
            }
            else {
                while (laneCars[sourceLane].length == maxLaneCars) { sourceLane = sourceLane%4+1; }
                laneOrder = laneCars[sourceLane].length;
                laneCars[sourceLane].push(carId);
            }

            this.carPaths[carId] = this._pathGenerator(sourceLane, targetLane, laneOrder);
        }
        this._generateGraph();
        this._layoutGraph();
    }

    get getTimingConflictGraph() {
        return this.timingConflictGraph;
    }
    showOnlyZones() {
        this.timingConflictGraph.elements('[?inLane]').style('visibility', 'hidden');
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
    showFull() {
        this.timingConflictGraph.elements('[?inLane]').style('visibility', 'visible');
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
    _toFullPath(path) {
        // console.log(path.sourceLanePath.map((elem)=> {return {inLane: true, position: [path.sourceLane,elem]};}));
        // console.log(path.sourceLanePath);
        let fullPath = []
        fullPath = fullPath.concat(path.sourceLanePath.map((elem)=> {return {inLane: true, position: elem};}));
        fullPath = fullPath.concat(path.conflictZonePath.map((elem)=> {return {inLane: false, position: elem};}));
        fullPath = fullPath.concat(path.targetLanePath.map((elem)=> {return {inLane: true, position: elem};}));
        // console.log(fullPath);
        return fullPath;
    }
}