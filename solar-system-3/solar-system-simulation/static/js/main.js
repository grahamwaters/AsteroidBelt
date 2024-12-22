// Get Canvas and Context
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

// Constants
const G = 1.0; // Increased gravitational constant for stronger sun influence
const SUN_MASS = 1.9885e7; // Increased scaled mass for the sun
const ASTEROID_MASS = 100; // Scaled mass for asteroids
const PARTICLE_MASS = 1; // Scaled mass for particles
const PARTICLE_COUNT = 30; // Number of particles generated upon collision
const ROCH_LIMIT_FACTOR = 2.44; // Roche limit factor

// Utility Functions
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function normalize(x, y) {
    const mag = Math.sqrt(x * x + y * y);
    return { x: x / mag, y: y / mag };
}

// Classes
class CelestialBody {
    constructor(x, y, radius, mass, color, velocity = { x: 0, y: 0 }, type = 'body') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        this.color = color;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.type = type; // 'body', 'planet', or 'particle'
    }

    applyForce(fx, fy) {
        this.vx += (fx / this.mass);
        this.vy += (fy / this.mass);
    }

    update() {
        if (this.type !== 'sun') { // Sun remains stationary
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        if (this.color === 'sun') {
            // Glowing effect for the sun
            const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.5, this.x, this.y, this.radius * 1.5);
            gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            ctx.fillStyle = gradient;
        } else if (this.type === 'particle') {
            // Particles with fading alpha
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle extends CelestialBody {
    constructor(x, y, inheritedVx, inheritedVy, additionalVx, additionalVy, life, color) {
        // Inherit velocity and add additional velocity away from collision point
        const totalVx = inheritedVx + additionalVx;
        const totalVy = inheritedVy + additionalVy;
        super(x, y, 2, PARTICLE_MASS, color, { x: totalVx, y: totalVy }, 'particle');
        this.life = life;
        this.alpha = 1.0;
    }

    update() {
        super.update();
        this.life -= 1;
        this.alpha = Math.max(this.life / 100, 0); // Prevent negative alpha
    }
}

// Initialize Bodies
const bodies = [];

// Create Sun at Center (fixed)
const sun = new CelestialBody(canvas.width / 2, canvas.height / 2, 50, SUN_MASS, 'sun');
bodies.push(sun);

// Function to Initialize Planets with Random Properties
function initializePlanets() {
    const planetColors = ['#1E90FF', '#FF4500', '#32CD32', '#FFD700', '#8A2BE2', '#FF69B4']; // Extended color palette
    const minPlanets = 3;
    const maxPlanets = 6;
    const planetCount = Math.floor(getRandom(minPlanets, maxPlanets + 1));

    for (let i = 0; i < planetCount; i++) {
        const radius = getRandom(10, 25); // Radius between 10 and 25
        const mass = getRandom(1e3, 1e4); // Mass between 1,000 and 10,000
        const distanceFromSun = getRandom(100, 300); // Distance from sun between 100 and 300
        const angle = getRandom(0, Math.PI * 2); // Random angle for orbital position
        const x = sun.x + distanceFromSun * Math.cos(angle);
        const y = sun.y + distanceFromSun * Math.sin(angle);
        const orbitalSpeed = Math.sqrt(G * sun.mass / distanceFromSun) * getRandom(0.5, 0.8); // Slowed down orbital speed
        const velocity = { x: -orbitalSpeed * Math.sin(angle), y: orbitalSpeed * Math.cos(angle) };
        const color = planetColors[i % planetColors.length];
        const planet = new CelestialBody(x, y, radius, mass, color, velocity, 'planet');
        bodies.push(planet);
    }
}

// Initialize Planets
initializePlanets();

// Asteroids Array
const asteroids = [];

// Particle Array
const particles = [];

// Function to Spawn Random Asteroids
function spawnAsteroid() {
    const edge = Math.floor(getRandom(0, 4));
    let x, y, vx, vy;
    const speed = getRandom(0.5, 3); // Speed between 0.5 and 3

    switch (edge) {
        case 0: // Top
            x = getRandom(0, canvas.width);
            y = -20;
            break;
        case 1: // Right
            x = canvas.width + 20;
            y = getRandom(0, canvas.height);
            break;
        case 2: // Bottom
            x = getRandom(0, canvas.width);
            y = canvas.height + 20;
            break;
        case 3: // Left
            x = -20;
            y = getRandom(0, canvas.height);
            break;
    }

    // Calculate direction towards center with some randomness
    const angle = Math.atan2(sun.y - y, sun.x - x) + getRandom(-Math.PI / 6, Math.PI / 6); // +/-30 degrees randomness
    vx = speed * Math.cos(angle);
    vy = speed * Math.sin(angle);

    const asteroid = new CelestialBody(x, y, 5, ASTEROID_MASS, '#888888', { x: vx, y: vy }, 'asteroid');
    asteroids.push(asteroid);
    bodies.push(asteroid);
}

// Spawn an asteroid every 1 second for increased activity
setInterval(spawnAsteroid, 1000);

// Function to Calculate Gravitational Forces Between All Bodies
function calculateGravitationalForces() {
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const bodyA = bodies[i];
            const bodyB = bodies[j];

            // Skip gravitational interaction if the body is the sun and it's fixed
            if (bodyA.type === 'sun' || bodyB.type === 'sun') continue;

            const dx = bodyB.x - bodyA.x;
            const dy = bodyB.y - bodyA.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist === 0) continue; // Prevent division by zero

            // Calculate gravitational force magnitude
            const force = (G * bodyA.mass * bodyB.mass) / (dist * dist);

            // Calculate force components
            const fx = force * (dx / dist);
            const fy = force * (dy / dist);

            // Apply forces (action and reaction)
            bodyA.applyForce(fx, fy);
            bodyB.applyForce(-fx, -fy);
        }
    }
}

// Function to Handle Collisions
function handleCollisions() {
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const bodyA = bodies[i];
            const bodyB = bodies[j];

            // Skip collision checks for particles to reduce computation
            if (bodyA.type === 'particle' || bodyB.type === 'particle') continue;

            const dist = distance(bodyA, bodyB);
            const minDist = bodyA.radius + bodyB.radius;

            if (dist < minDist) {
                // Check if within Roche limit for planet-planet collisions
                if (bodyA.type === 'planet' && bodyB.type === 'planet') {
                    const rocheLimit = ROCH_LIMIT_FACTOR * Math.min(bodyA.radius, bodyB.radius); // Simplified Roche limit
                    if (dist < rocheLimit) {
                        // Smash planets: break both into smaller particles
                        createSmashParticles(bodyA, bodyB);
                        // Remove planets from bodies array
                        removeBody(i);
                        removeBody(j - 1); // Adjust index after removal
                    } else {
                        // Merge planets: create a new planet with combined mass and momentum
                        mergePlanets(i, j);
                    }
                } else {
                    // Collision between asteroid and planet/sun
                    createCollisionParticles(bodyA, bodyB);
                    // Remove asteroid from bodies and asteroids array
                    if (bodyA.type === 'asteroid') {
                        removeBody(i);
                        j--; // Adjust index after removal
                    }
                    if (bodyB.type === 'asteroid') {
                        removeBody(j);
                        j--; // Adjust index after removal
                    }
                }
            }
        }
    }
}

// Function to Remove a Body by Index
function removeBody(index) {
    const body = bodies[index];
    if (body.type === 'asteroid') {
        const asteroidIndex = asteroids.indexOf(body);
        if (asteroidIndex > -1) asteroids.splice(asteroidIndex, 1);
    }
    bodies.splice(index, 1);
}

// Function to Merge Two Planets
function mergePlanets(indexA, indexB) {
    const bodyA = bodies[indexA];
    const bodyB = bodies[indexB];

    // Calculate new mass and position (center of mass)
    const newMass = bodyA.mass + bodyB.mass;
    const newX = (bodyA.x * bodyA.mass + bodyB.x * bodyB.mass) / newMass;
    const newY = (bodyA.y * bodyA.mass + bodyB.y * bodyB.mass) / newMass;

    // Calculate new velocity (momentum conservation)
    const newVx = (bodyA.vx * bodyA.mass + bodyB.vx * bodyB.mass) / newMass;
    const newVy = (bodyA.vy * bodyA.mass + bodyB.vy * bodyB.mass) / newMass;

    // Create new merged planet
    const newRadius = Math.cbrt(bodyA.radius ** 3 + bodyB.radius ** 3); // Volume conservation
    const newColor = blendColors(bodyA.color, bodyB.color);
    const mergedPlanet = new CelestialBody(newX, newY, newRadius, newMass, newColor, { x: newVx, y: newVy }, 'planet');

    // Remove original planets
    removeBody(indexA);
    removeBody(indexB - 1); // Adjust index after removal

    // Add merged planet
    bodies.push(mergedPlanet);
}

// Function to Blend Two Colors
function blendColors(colorA, colorB) {
    // Convert hex to RGB
    const rgbA = hexToRgb(colorA);
    const rgbB = hexToRgb(colorB);
    // Average the colors
    const r = Math.floor((rgbA.r + rgbB.r) / 2);
    const g = Math.floor((rgbA.g + rgbB.g) / 2);
    const b = Math.floor((rgbA.b + rgbB.b) / 2);
    return `rgb(${r}, ${g}, ${b})`;
}

// Function to Convert Hex to RGB
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : { r: 255, g: 255, b: 255 }; // Default to white if parsing fails
}

// Function to Create Collision Particles (Asteroid Collisions)
function createCollisionParticles(bodyA, bodyB) {
    // Determine which body is the asteroid and which is the target
    let asteroid, target;
    if (bodyA.type === 'asteroid') {
        asteroid = bodyA;
        target = bodyB;
    } else if (bodyB.type === 'asteroid') {
        asteroid = bodyB;
        target = bodyA;
    } else {
        // If neither is an asteroid, skip
        return;
    }

    // Calculate the direction away from the collision point (away from the target)
    const dx = asteroid.x - target.x;
    const dy = asteroid.y - target.y;
    const direction = normalize(dx, dy);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Limit additional speed to realistic values
        const additionalSpeed = getRandom(0.5, 2);
        const additionalVx = direction.x * additionalSpeed;
        const additionalVy = direction.y * additionalSpeed;

        // Create particle inheriting asteroid's velocity and adding additional velocity
        const particle = new Particle(
            asteroid.x,
            asteroid.y,
            asteroid.vx,
            asteroid.vy,
            additionalVx,
            additionalVy,
            100,
            { r: 255, g: 165, b: 0 } // Orange color for debris
        );

        particles.push(particle);
        bodies.push(particle);
    }
}

// Function to Create Particle Clouds when Planets Smash
function createSmashParticles(bodyA, bodyB) {
    const collisionX = (bodyA.x + bodyB.x) / 2;
    const collisionY = (bodyA.y + bodyB.y) / 2;

    // Calculate the direction vectors from each body to the collision point
    const directionA = normalize(collisionX - bodyA.x, collisionY - bodyA.y);
    const directionB = normalize(collisionX - bodyB.x, collisionY - bodyB.y);

    for (let i = 0; i < PARTICLE_COUNT * 2; i++) { // More particles for smashing
        const angle = getRandom(0, Math.PI * 2);
        const speed = getRandom(0.5, 3); // Reduced speed for realism
        const additionalVx = Math.cos(angle) * speed;
        const additionalVy = Math.sin(angle) * speed;

        // Particles inherit the average velocity of both planets
        const inheritedVx = (bodyA.vx + bodyB.vx) / 2;
        const inheritedVy = (bodyA.vy + bodyB.vy) / 2;

        // Create particle with inherited and additional velocities
        const particle = new Particle(
            collisionX,
            collisionY,
            inheritedVx,
            inheritedVy,
            additionalVx,
            additionalVy,
            150,
            { r: 255, g: 69, b: 0 } // Red-orange for smashing debris
        );

        particles.push(particle);
        bodies.push(particle);
    }
}

// Draw Function
function draw() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bodies
    bodies.forEach((body) => body.draw(ctx));
}

// Update Function
function update() {
    // Calculate gravitational forces between all bodies
    calculateGravitationalForces();

    // Update positions of all bodies
    bodies.forEach((body) => body.update());

    // Handle collisions
    handleCollisions();

    // Update and remove expired particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life <= 0) {
            bodies.splice(bodies.indexOf(particles[i]), 1);
            particles.splice(i, 1);
        }
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    update();
    draw();
}

animate();

// Set Canvas to Full Screen and Re-center Sun on Resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Re-center the sun
    sun.x = canvas.width / 2;
    sun.y = canvas.height / 2;
}

window.addEventListener('resize', resizeCanvas);
