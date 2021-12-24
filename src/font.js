import {FontLoader} from 'three/examples/jsm/loaders/FontLoader'
import jsonFont from '../assets/fonts/Roboto_Bold.json'
const loader = new FontLoader();
const font = loader.parse(jsonFont);

export {font};