import * as THREE from 'three';

let collisions = [];

// Register collision detection callback
export function detectCollisions(world, onCollision) {
  world.addEventListener('postStep', () => {
    collisions = world.contacts.filter(contact => {
      return contact.bi && contact.bj; // Ensure both bodies exist
    });

    collisions.forEach(contact => {
      onCollision(contact.bi, contact.bj);
    });
  });
}

// Example callback: Log collision and create explosion effect
export function onCollision(bodyA, bodyB) {
  console.log(`Collision detected between ${bodyA.id} and ${bodyB.id}`);
  createExplosion(bodyA.position);
}

// Create a particle explosion at a given position
export function createExplosion(position) {
  const particles = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff0000 }),
    100
  );

  particles.position.copy(position);

  for (let i = 0; i < 100; i++) {
    const offset = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).multiplyScalar(5);

    particles.setMatrixAt(i, new THREE.Matrix4().makeTranslation(offset.x, offset.y, offset.z));
  }

  setTimeout(() => {
    particles.geometry.dispose();
    particles.material.dispose();
    particles.parent.remove(particles);
  }, 2000);

  return particles;
}
