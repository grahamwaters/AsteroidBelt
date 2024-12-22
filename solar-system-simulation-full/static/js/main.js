import { initScene, animate } from './scene.js';
import { createSun, generatePlanets, createMoonsForPlanets } from './celestial.js';
import { createAsteroidBelt, updateAsteroidBelt } from './asteroidBelt.js';
import { initUI, updateSpeedIndicator } from './ui.js';
import { initControls, registerClickableObjects, simulationSpeed } from './controls.js';
import { initPhysicsWorld, createPhysicsBody, syncPhysicsWithMeshes } from './physics.js';
import { applyGravity } from './gravity.js';
import { detectCollisions, onCollision } from './collisions.js';

let planets = [];
let bodies = [];
let meshes = [];
let world;

// Initialize simulation on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initUI();

  const { scene } = initScene();
  world = initPhysicsWorld();

  const sun = createSun(scene);
  const sunBody = createPhysicsBody(sun, 1000);
  world.addBody(sunBody);
  bodies.push(sunBody);
  meshes.push(sun);

  planets = generatePlanets(scene);

  planets.forEach(planet => {
    const planetBody = createPhysicsBody(planet.mesh, planet.mass);
    world.addBody(planetBody);
    bodies.push(planetBody);
    meshes.push(planet.mesh);
  });

  createMoonsForPlanets(planets);
  createAsteroidBelt(scene);

  registerClickableObjects(sun);
  planets.forEach(p => registerClickableObjects(p.mesh));

  detectCollisions(world, onCollision);

  animate(() => {
    bodies.forEach((body, i) => {
      applyGravity(bodies[0], body);
    });
    world.step(1 / 60);
    syncPhysicsWithMeshes(bodies, meshes);
    updateAsteroidBelt(simulationSpeed);
    updateSpeedIndicator(simulationSpeed);
  });
});