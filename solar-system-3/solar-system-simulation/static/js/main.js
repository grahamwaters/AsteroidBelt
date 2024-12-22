// Initialize Three.js Scene
const scene = new THREE.Scene();

// Initialize Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);
camera.position.z = 500;

// Initialize Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize Cannon.js Physics World
const world = new CANNON.World();
world.gravity.set(0, 0, 0); // No global gravity; we'll handle gravity between bodies
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

// Arrays to hold bodies and meshes
const bodies = [];
const meshes = [];

// Function to create a celestial body
function createBody(mass, radius, position, color) {
    // Three.js Mesh
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    scene.add(mesh);
    meshes.push(mesh);

    // Cannon.js Body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({ mass: mass, shape: shape });
    body.position.copy(position);
    world.addBody(body);
    bodies.push(body);
}

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Create Sun
createBody(10000, 50, new CANNON.Vec3(0, 0, 0), 0xFFFF00);

// Create Planets
const planetColors = [0x0000FF, 0xFF0000, 0x00FF00, 0xFFA500];
for (let i = 1; i <= 4; i++) {
    const distance = 100 * i + (Math.random() * 20 - 10);
    const angle = Math.random() * Math.PI * 2;
    const position = new CANNON.Vec3(
        distance * Math.cos(angle),
        (Math.random() * 20 - 10),
        distance * Math.sin(angle)
    );
    createBody(10, 10, position, planetColors[i - 1]);

    // Assign initial velocity for orbit
    const speed = Math.sqrt((6.67430e-1 * bodies[0].mass) / distance); // Gravitational constant adjusted
    const velocity = new CANNON.Vec3(
        -speed * Math.sin(angle),
        0,
        speed * Math.cos(angle)
    );
    bodies[bodies.length -1].velocity.copy(velocity);
}

// Create Asteroids
for (let i = 0; i < 100; i++) {
    const distance = 300 + Math.random() * 200;
    const angle = Math.random() * Math.PI * 2;
    const position = new CANNON.Vec3(
        distance * Math.cos(angle),
        (Math.random() * 50 - 25),
        distance * Math.sin(angle)
    );
    createBody(1, 2, position, 0x888888);

    // Assign random velocity
    const speed = 1 + Math.random() * 2;
    const velocity = new CANNON.Vec3(
        -speed * Math.sin(angle),
        0,
        speed * Math.cos(angle)
    );
    bodies[bodies.length -1].velocity.copy(velocity);
}

// Add Physics Materials
const material = new CANNON.Material("planetMaterial");
const contactMaterial = new CANNON.ContactMaterial(material, material, {
    friction: 0.0,
    restitution: 0.9
});
world.addContactMaterial(contactMaterial);

// Assign material to all bodies
bodies.forEach(body => {
    body.material = material;
});

// Function to apply gravitational forces
function applyGravity() {
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const bodyA = bodies[i];
            const bodyB = bodies[j];
            const distanceVec = new CANNON.Vec3().copy(bodyB.position).vsub(bodyA.position);
            const distance = distanceVec.length();
            if (distance === 0) continue; // Prevent division by zero
            const G = 6.67430e-2; // Adjusted gravitational constant for simulation
            const forceMagnitude = (G * bodyA.mass * bodyB.mass) / (distance * distance);
            const force = distanceVec.unit().scale(forceMagnitude);
            bodyA.applyForce(force, bodyA.position);
            bodyB.applyForce(force.scale(-1), bodyB.position);
        }
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Apply gravity
    applyGravity();

    // Step the physics world
    world.step(1/60);

    // Update mesh positions
    for (let i = 0; i < meshes.length; i++) {
        meshes[i].position.copy(bodies[i].position);
    }

    renderer.render(scene, camera);
}

animate();
