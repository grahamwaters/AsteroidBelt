import { animate, initScene } from './scene.js';
import { createAsteroidBelt, updateAsteroidBelt } from './asteroidBelt.js';
import { createMoonsForPlanets, createSun, generatePlanets } from './celestial.js';
import { createPhysicsBody, initPhysicsWorld, syncPhysicsWithMeshes } from './physics.js';
import { detectCollisions, onCollision } from './collisions.js';
import { initControls, registerClickableObjects, simulationSpeed } from './controls.js';
import { initUI, updateSpeedIndicator } from './ui.js';

import { CONFIG } from './config.js';
import { applyGravity } from './gravity.js';

let planets = [];
let bodies = [];
let meshes = [];
let world;

// Initialize simulation on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  initUI();

  // Initialize scene
  const { scene } = initScene();

  // Create physics world
  world = initPhysicsWorld();

  // Create the sun
  const sun = createSun(scene);
  const sunBody = createPhysicsBody(sun, CONFIG.SUN.mass);
  world.addBody(sunBody);
  bodies.push(sunBody);
  meshes.push(sun);

  // Generate planets
  planets = generatePlanets(scene);

  // Add planets to the physics world
  planets.forEach(planet => {
    const planetBody = createPhysicsBody(planet.mesh, planet.mass);
    world.addBody(planetBody);
    bodies.push(planetBody);
    meshes.push(planet.mesh);
  });

  // Create moons and add them to the physics world
  createMoonsForPlanets(planets).forEach(moon => {
    const moonBody = createPhysicsBody(moon.mesh, moon.mass);
    world.addBody(moonBody);
    bodies.push(moonBody);
    meshes.push(moon.mesh);
  });

  // Create asteroid belt
  createAsteroidBelt(scene);

  // Register clickable objects
  registerClickableObjects(sun);
  planets.forEach(p => {
    registerClickableObjects(p.mesh);
    if (p.moons) {
      p.moons.forEach(m => registerClickableObjects(m.mesh));
    }
  });

  // Detect collisions
  detectCollisions(world, onCollision);

  // Start animation loop
  animate(() => {
    // Apply gravity between all physics bodies
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        applyGravity(bodies[i], bodies[j], CONFIG.GRAVITY_CONSTANT);
      }
    }

    // Step the physics world
    world.step(1 / 60);

    // Sync meshes with physics bodies
    syncPhysicsWithMeshes(bodies, meshes);

    // Update asteroid belt
    updateAsteroidBelt(simulationSpeed);

    // Update speed indicator
    updateSpeedIndicator(simulationSpeed);
  });
});
