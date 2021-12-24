import { modelNames } from './models';

function randomStuff(width, height, group, num) {
    const stuffs = [];
    for (let index = 0; index < num; index++) {
        let x = Math.floor(Math.random() * width) - width / 2;
        let y = Math.floor(Math.random() * height) - height / 2;
        let z = 0;
        stuffs.push([modelNames[0], group, [x, y, z]]);
    }
    return stuffs;
}

export {randomStuff};