import * as THREE from 'three';

export function initScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').appendChild(renderer.domElement);

  return { scene, camera, renderer };
}

export function animate(callback) {
  function loop() {
    requestAnimationFrame(loop);
    callback();
  }
  loop();
}