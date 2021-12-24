const models = {
    trees: {
        url: 'models/trees/scene.gltf',
        models: {
            cube_tree: {
                positionOffset: [0, 0, 0],
                rotationOffset: [Math.PI/2, 0, 0],
                scale: [50, 50, 50]
            },
            bonsai: {
                positionOffset: [0, 0, 150],
                rotationOffset: [Math.PI/2, 0, 0],
                scale: [50, 50, 50]
            },
            bonsai_2: {
                positionOffset: [0, 0, 150],
                rotationOffset: [Math.PI/2, 0, 0],
                scale: [50, 50, 50]
            },
            sky_tree: {
                positionOffset: [0, 0, 30],
                rotationOffset: [Math.PI/2, 0, 0],
                scale: [50, 50, 50]
            },
            dark_pine: {
                positionOffset: [0, 0, 90],
                rotationOffset: [Math.PI/2, 0, 0],
                scale: [50, 50, 50]
            },
            deth_pine: {
                positionOffset: [0, 0, 50],
                rotationOffset: [Math.PI/2, 0, 0],
                scale: [50, 50, 50]
            },
            semi_deth_pine: {
                positionOffset: [0, 0, 100],
                rotationOffset: [Math.PI/2, 0, 0],
                scale: [50, 50, 50]
            },
            birch: {
                positionOffset: [0, 0, 180],
                rotationOffset: [Math.PI/2, 0, 0],
                scale: [50, 50, 50]
            },
            fruit_cube_tree: {
                positionOffset: [0, 0, 150],
                rotationOffset: [Math.PI/2, 0, 0],
                scale: [50, 50, 50]
            }
        }
    }
}
const modelNames = Object.keys(models);

export {models, modelNames};