import { CONFIG } from './config.js';

let instancedAsteroids;
let asteroidAngles = [];
let asteroidSpeeds = [];
let dummy = new THREE.Object3D();

export function createAsteroidBelt(scene) {
  const { count, beltInner, beltOuter } = CONFIG.ASTEROIDS;
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0x888888 });

  instancedAsteroids = new THREE.InstancedMesh(geometry, material, count);

  for (let i = 0; i < count; i++) {
    const distance = Math.random() * (beltOuter - beltInner) + beltInner;
    const angle = Math.random() * Math.PI * 2;
    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);

    dummy.position.set(x, 0, z);
    dummy.updateMatrix();
    instancedAsteroids.setMatrixAt(i, dummy.matrix);

    const speed = Math.random() * 0.002 + 0.001;
    asteroidSpeeds.push(speed);
    asteroidAngles.push(angle);
  }

  scene.add(instancedAsteroids);
}

export function updateAsteroidBelt(simulationSpeed) {
  const { count, beltInner, beltOuter } = CONFIG.ASTEROIDS;

  for (let i = 0; i < count; i++) {
    asteroidAngles[i] += asteroidSpeeds[i] * simulationSpeed;

    const distance = beltInner + (beltOuter - beltInner) * (i / count);
    const x = distance * Math.cos(asteroidAngles[i]);
    const z = distance * Math.sin(asteroidAngles[i]);

    dummy.position.set(x, 0, z);
    dummy.updateMatrix();
    instancedAsteroids.setMatrixAt(i, dummy.matrix);
  }

  instancedAsteroids.instanceMatrix.needsUpdate = true;
}
