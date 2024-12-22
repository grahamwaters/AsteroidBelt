import * as THREE from 'three';

let world;

// Initialize the physics world
export function initPhysicsWorld() {
  world = new CANNON.World();
  world.gravity.set(0, 0, 0); // Zero gravity for now; simulate manually
  world.broadphase = new CANNON.NaiveBroadphase(); // Efficient for small systems
  world.solver.iterations = 10;

  return world;
}

// Create a physics body for a celestial object
export function createPhysicsBody(mesh, mass) {
  const shape = new CANNON.Sphere(mesh.geometry.parameters.radius);
  const body = new CANNON.Body({ mass, shape });
  body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
  return body;
}

// Update the positions of meshes based on physics
export function syncPhysicsWithMeshes(bodies, meshes) {
  bodies.forEach((body, i) => {
    meshes[i].position.copy(body.position);
    meshes[i].quaternion.copy(body.quaternion);
  });
}
