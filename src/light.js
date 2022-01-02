import { SCENE_HEIGHT, SCENE_WIDTH, NEAR_PLANE, FAR_PLANE } from "./constants";

// Set up lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, -300, 300);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = SCENE_WIDTH;
dirLight.shadow.mapSize.height = SCENE_HEIGHT;
dirLight.shadow.camera.left = -SCENE_WIDTH/2;
dirLight.shadow.camera.right = SCENE_WIDTH/2;
dirLight.shadow.camera.top = SCENE_HEIGHT/2;
dirLight.shadow.camera.bottom = -SCENE_HEIGHT/2;
dirLight.shadow.camera.near = NEAR_PLANE;
dirLight.shadow.camera.far = FAR_PLANE;

export {ambientLight, dirLight};
