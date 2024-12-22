import { CONFIG } from './config.js';

let planetCounter = 1;
let moonCounter = 1;

export function createSun(scene) {
  const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.name = 'Sun';
  scene.add(sun);
  return sun;
}

export function generatePlanets(scene) {
  const {
    minCount, maxCount, minDistance, minDistanceBetweenPlanets, planetSizeRange
  } = CONFIG.PLANETS;

  const numPlanets = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  const planets = [];

  let currentDistance = minDistance;
  for (let i = 0; i < numPlanets; i++) {
    const size = randomRange(planetSizeRange.min, planetSizeRange.max);
    currentDistance += size + minDistanceBetweenPlanets;

    const distance = currentDistance;
    const speed = (0.01 / distance) * (i + 1);
    const color = new THREE.Color(Math.random(), Math.random(), Math.random());

    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color });
    const planet = new THREE.Mesh(geometry, material);

    planet.name = \`Planet \${planetCounter++}\`;

    const pivot = new THREE.Object3D();
    scene.add(pivot);
    pivot.add(planet);

    pivot.rotation.z = randomRange(-0.1, 0.1);

    planet.position.set(distance, 0, 0);

    planets.push({ mesh: planet, pivot, speed, distance, size });
  }
  return planets;
}

export function createMoonsForPlanets(planets) {
  const { maxMoonsPerPlanet, moonSizeRange } = CONFIG.PLANETS;

  planets.forEach(planet => {
    const numMoons = Math.floor(Math.random() * (maxMoonsPerPlanet + 1));
    for (let i = 0; i < numMoons; i++) {
      const moonSize = randomRange(moonSizeRange.min, moonSizeRange.max);
      const distance = planet.size + randomRange(2, 5);
      const speed = Math.random() * 0.02 + 0.005;
      const color = new THREE.Color(Math.random(), Math.random(), Math.random());

      const geometry = new THREE.SphereGeometry(moonSize, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color });
      const moon = new THREE.Mesh(geometry, material);

      moon.name = \`Moon \${moonCounter++}\`;

      const moonPivot = new THREE.Object3D();
      planet.mesh.add(moonPivot);
      moonPivot.add(moon);

      moon.position.set(distance, 0, 0);
      moonPivot.rotation.z = randomRange(-0.1, 0.1);

      planet.moons = planet.moons || [];
      planet.moons.push({ mesh: moon, pivot: moonPivot, speed });
    }
  });
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}
