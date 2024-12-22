// Get Canvas and Context
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

// Set Canvas to Full Screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Constants
const G = 0.1; // Gravitational constant (adjusted for simulation)
const SUN_MASS = 10000;
const PLANET_MASS = 100;
const ASTEROID_MASS = 10;
const PARTICLE_COUNT = 20;

// Utility Functions
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2);
}

function normalize(x, y) {
    const mag = Math.sqrt(x*x + y*y);
    return { x: x / mag, y: y / mag };
}

// Classes
class CelestialBody {
    constructor(x, y, radius, mass, color, velocity = {x: 0, y: 0}) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        this.color = color;
        this.vx = velocity.x;
        this.vy = velocity.y;
    }

    applyForce(fx, fy) {
        this.vx += fx / this.mass;
        this.vy += fy / this.mass;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.beginPath();
        if (this.color === 'sun') {
            // Create a glowing effect for the sun
            const gradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.5, this.x, this.y, this.radius * 1.5);
            gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, vx, vy, life, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 1;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life / 100})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize Bodies
const bodies = [];

// Create Sun at Center
const sun = new CelestialBody(canvas.width / 2, canvas.height / 2, 50, SUN_MASS, 'sun');
bodies.push(sun);

// Create Planets
const planetColors = ['#0000FF', '#FF0000', '#00FF00', '#FFA500'];
for (let i = 1; i <= 4; i++) {
    const distance = 150 * i;
    const angle = getRandom(0, Math.PI * 2);
    const x = sun.x + distance * Math.cos(angle);
    const y = sun.y + distance * Math.sin(angle);
    const speed = Math.sqrt(G * sun.mass / distance);
    const velocity = { x: -speed * Math.sin(angle), y: speed * Math.cos(angle) };
    const planet = new CelestialBody(x, y, 15, PLANET_MASS, planetColors[i - 1], velocity);
    bodies.push(planet);
}

// Asteroids Array
const asteroids = [];

// Particle Array
const particles = [];

// Function to Spawn Random Asteroids
function spawnAsteroid() {
    const edge = Math.floor(getRandom(0, 4));
    let x, y, vx, vy;
    const speed = getRandom(0.5, 2);

    switch(edge) {
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
    const angle = Math.atan2(sun.y - y, sun.x - x) + getRandom(-0.1, 0.1);
    vx = speed * Math.cos(angle);
    vy = speed * Math.sin(angle);

    const asteroid = new CelestialBody(x, y, 5, ASTEROID_MASS, '#888888', {x: vx, y: vy});
    asteroids.push(asteroid);
    bodies.push(asteroid);
}

// Spawn an asteroid every 2 seconds
setInterval(spawnAsteroid, 2000);

// Update Function
function update() {
    // Apply Gravitational Forces
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const bodyA = bodies[i];
            const bodyB = bodies[j];
            const dx = bodyB.x - bodyA.x;
            const dy = bodyB.y - bodyA.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) continue; // Prevent division by zero

            // Calculate gravitational force
            const force = (G * bodyA.mass * bodyB.mass) / (dist * dist);
            const fx = force * (dx / dist);
            const fy = force * (dy / dist);

            // Apply forces
            bodyA.applyForce(fx, fy);
            bodyB.applyForce(-fx, -fy);
        }
    }

    // Update Positions
    bodies.forEach(body => body.update());

    // Collision Detection
    for (let i = 0; i < asteroids.length; i++) {
        for (let j = 0; j < bodies.length; j++) {
            if (asteroids[i] === bodies[j]) continue; // Skip self
            const other = bodies[j];
            const dist = distance(asteroids[i], other);
            if (dist < asteroids[i].radius + other.radius) {
                // Collision Detected
                createParticleCloud(asteroids[i].x, asteroids[i].y);
                // Remove asteroid
                bodies.splice(bodies.indexOf(asteroids[i]), 1);
                asteroids.splice(i, 1);
                i--;
                break;
            }
        }
    }

    // Update Particles
    particles.forEach((particle, index) => {
        particle.update();
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Function to Create Particle Clouds on Collision
function createParticleCloud(x, y) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = getRandom(0, Math.PI * 2);
        const speed = getRandom(1, 5);
        const vx = speed * Math.cos(angle);
        const vy = speed * Math.sin(angle);
        const life = 100;
        const color = { r: 255, g: 165, b: 0 }; // Orange color
        const particle = new Particle(x, y, vx, vy, life, color);
        particles.push(particle);
    }
}

// Draw Function
function draw() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bodies
    bodies.forEach(body => body.draw(ctx));

    // Draw Particles
    particles.forEach(particle => particle.draw(ctx));
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    update();
    draw();
}

animate();
