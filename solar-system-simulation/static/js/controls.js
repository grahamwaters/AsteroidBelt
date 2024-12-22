import { CONFIG } from './config.js';
import { displayInfo } from './ui.js';

let controls;
let camera;
let renderer;
let raycaster;
let mouse;
let clickableObjects = [];

export let simulationSpeed = CONFIG.SPEED.initial;

export function initControls(cam, rend) {
  camera = cam;
  renderer = rend;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 20;
  controls.maxDistance = 300;
  controls.maxPolarAngle = Math.PI / 2;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('click', onMouseClick);
  window.addEventListener('keydown', onKeyDown);
}

export function registerClickableObjects(...objects) {
  clickableObjects.push(...objects);
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects, true);
  if (intersects.length > 0) {
    displayInfo(intersects[0].object);
  }
}

function onKeyDown(event) {
  const { minSpeed, maxSpeed } = CONFIG.SPEED;
  switch (event.key) {
    case '+':
    case '=':
      simulationSpeed *= 1.1;
      if (simulationSpeed > maxSpeed) simulationSpeed = maxSpeed;
      break;
    case '-':
    case '_':
      simulationSpeed /= 1.1;
      if (simulationSpeed < minSpeed) simulationSpeed = minSpeed;
      break;
    case '0':
      simulationSpeed = 1;
      break;
    // Additional interactions:
    // case 'n':
    //   // e.g., Add a new planet
    //   break;
    default:
      break;
  }
}

export function updateControls() {
  controls.update();
}
