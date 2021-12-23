import IntersectionManagement from './intersectionManagement.js';

export default class extends IntersectionManagement {
    constructor(nPrev = 50) {
        super();
        this.carPositions = {};
        this.nPrev = nPrev;
        this.prevNodes = [];
    }

    pickRandomSolution() {
        let edges = this.timingConflictGraph.filter('edge[type = 3]');
        let edges_sort = edges.sort((a, b) => a.data('id') - b.data('id'))
        let retryNum = 1000;
        do {
            for (let index = 0; index < edges_sort.length / 2; index++) {
                if (Math.random() > 0.5) {
                    edges_sort[index * 2].addClass(['cy-disabled']);
                    edges_sort[index * 2 + 1].removeClass(['cy-disabled']);
                }
                else {
                    edges_sort[index * 2].removeClass(['cy-disabled']);
                    edges_sort[index * 2 + 1].addClass(['cy-disabled']);
                }
            }
        } while (this.isCycleExist() && retryNum-- > 0);
        if (this.isCycleExist()) {
            alert('no solution found');
        }
    }
    _getZeroIncomerNodes() {
        return this.timingConflictGraph.elements().filter('.cy-node-current').filter((node)=>{
            // console.log(node.outgoers('edge[type = 1]')[0]?.target().incomers('edge[type != 1]').not('.cy-disabled, .cy-transparent'));
            return (node.outgoers('edge[type = 1]')[0]?.target().incomers('edge[type != 1]').not('.cy-disabled, .cy-transparent').length) ? false: true;
        })
    }
    _getFullGraph() {
        return this.timingConflictGraph.elements().not('.cy-disabled');
    }
    isCycleExist(select = false) {
        let scc = this._getFullGraph().filter('[!inLane]').tarjanStronglyConnectedComponents()
        if (select) {
            this.timingConflictGraph.elements().removeClass(['cy-selected']);
            for (let index = 0; index < scc.components.length; index++)
                if (scc.components[index].length > 1) {
                    // only select the first one
                    scc.components[index].addClass(['cy-selected']);
                    break;
                }
        }
        return scc.components.some((scc) => scc.length > 1);
    }

    reset() {
        this.carPositions = {};
        let fullGraph = this._getFullGraph();
        fullGraph.removeClass(['cy-transparent']);
        fullGraph.removeClass(['cy-node-current']);
        let nodes = fullGraph.filter('node[[indegree = 0]]');
        nodes.forEach((node) => {
            this.carPositions[node.data('car')] = {
                inLane: node.data('inLane'),
                position: node.data('position')
            }
        });
        nodes.addClass(['cy-node-current']);
        return this.carPaths;
    }

    stepNext() {
        if (this.prevNodes.length > this.nPrev) {
            this.prevNodes.shift();
            this.prevNodes.push(this.timingConflictGraph.elements('.cy-node-current'));
        }
        else
            this.prevNodes.push(this.timingConflictGraph.elements('.cy-node-current'));
        let movableNodes = this._getZeroIncomerNodes();
        movableNodes.forEach((node) => {
            // TODO: check if the node meet the end condition
            node.removeClass(['cy-node-current']);
            node.addClass(['cy-transparent']);
            let outgoers = node.outgoers('edge').not('.cy-disabled');
            outgoers.addClass(['cy-transparent']);
            let nextEdge = outgoers.filter('[type = 1]')[0];
            if (!nextEdge) {
                this.carPositions[node.data('car')] = {
                    inLane: true,
                    position: null
                };
            }
            else {
                let nextNode = nextEdge.target();
                this.carPositions[node.data('car')] = {
                    inLane: nextNode.data('inLane'),
                    position: nextNode.data('position')
                };
                nextNode.addClass(['cy-node-current']);
            }
        });
        return movableNodes.map((d)=>d.data('car'));
    }
    stepPrev() {
        let prevNodes = this.prevNodes.pop();
        if (!prevNodes)
            return;
        let currentNodes = this.timingConflictGraph.elements().filter('.cy-node-current');
        currentNodes.removeClass(['cy-node-current']);
        prevNodes.addClass(['cy-node-current']);
        prevNodes.removeClass(['cy-transparent']);
        prevNodes.outgoers('edge').removeClass(['cy-transparent']);
        prevNodes.forEach((node) => {
            this.carPositions[node.data('car')] = {
                inLane: node.data('inLane'),
                position: node.data('position')
            };
        });
    }
    getCarInfos() {
        let carInfos = {};
        for (let car in this.carPositions) {
            let carPath = this._toFullPath(this.carPaths[car]);
            // console.log(car,JSON.stringify(carPath[0]));
            // console.log(JSON.stringify(this.carPositions[car]));
            let pathIndex = carPath.findIndex((elem)=>JSON.stringify(elem)==JSON.stringify(this.carPositions[car]));
            // console.log(pathIndex);
            if (pathIndex != undefined) {
                if (pathIndex == 0) {
                    carInfos[car] = {
                        fromZone: undefined,
                        atZone: carPath[pathIndex],
                        toZone: carPath[pathIndex+1]
                    }
                }
                else {
                    carInfos[car] = {
                        fromZone: carPath[pathIndex-1],
                        atZone: carPath[pathIndex],
                        toZone: carPath[pathIndex+1]
                    }
                }
            }
            else {
                carInfos[car] = {
                    fromZone: carPath[this.carPath.length-1],
                    atZone: undefined,
                    toZone: undefined
                }
            }
        }
        return carInfos;
    }
}
