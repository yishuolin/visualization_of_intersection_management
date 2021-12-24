import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {models} from './models';

class ModelManager {
    constructor() {
        this.units = {};
    }

    load() {
        const loader = new GLTFLoader();
        for (const [model, units] of Object.entries(this.units)) {
            const objNames = Object.keys(models[model].models);
            loader.load(models[model].url, (gltf) => {
                for (const unit of units) {
                    const objName = objNames[Math.floor(Math.random() * objNames.length)];
                    const obj = gltf.scene.getObjectByName(objName).clone();
                    obj.position.set(...unit.position);
                    
                    obj.scale.set(...models[model].models[objName].scale);
                    obj.position.x += models[model].models[objName].positionOffset[0];
                    obj.position.y += models[model].models[objName].positionOffset[1];
                    obj.position.z += models[model].models[objName].positionOffset[2];

                    obj.rotation.x += models[model].models[objName].rotationOffset[0];
                    obj.rotation.y += models[model].models[objName].rotationOffset[1];
                    obj.rotation.z += models[model].models[objName].rotationOffset[2];
                    // obj.castShadow = true;
                    // obj.receiveShadow = true;
                    unit.group.add(obj);
                }
            });
        }
    }
    
    add(model_name, group, position) {
        if (!this.units[model_name]) {
            this.units[model_name] = [];
        }
        this.units[model_name].push({
            group: group, 
            position: position
        });
    }
}

export {ModelManager};