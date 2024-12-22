import { CONFIG } from './config.js';
import { initControls, updateControls } from './controls.js';
import { stats } from './ui.js';

let scene, camera, renderer;

export function initScene() {
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  const { fov, near, far, initialPosition } = CONFIG.CAMERA;
  camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
  camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').appendChild(renderer.domElement);

  // Listen for window resize
  window.addEventListener('resize', onWindowResize);

  // Initialize controls
  initControls(camera, renderer);

  return { scene, camera, renderer };
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

export function animate(updateCallback) {
  requestAnimationFrame(() => animate(updateCallback));
  stats.begin();

  // Custom update logic (planets, asteroids, etc.)
  updateCallback();

  // Update controls & render
  updateControls();
  renderer.render(scene, camera);

  stats.end();
}
