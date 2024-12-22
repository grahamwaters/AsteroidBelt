// Constants
const G = 6.67430e-11; // Gravitational constant (m^3 kg^-1 s^-2)
const timeStep = 1000; // Time step in seconds

// Star class
class Star {
    constructor(name, mass, x, y, vx, vy, color) {
        this.name = name;
        this.mass = mass; // in kg
        this.x = x; // position in meters
        this.y = y; // position in meters
        this.vx = vx; // velocity in m/s
        this.vy = vy; // velocity in m/s
        this.ax = 0; // acceleration in m/s^2
        this.ay = 0; // acceleration in m/s^2
        this.color = color;
    }

    // Update acceleration due to another star
    computeAcceleration(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distanceSq = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSq);
        const force = (G * this.mass * other.mass) / distanceSq;
        this.ax = force * dx / (distance * this.mass);
        this.ay = force * dy / (distance * this.mass);
    }

    // Update velocity and position using acceleration
    updatePosition() {
        this.vx += this.ax * timeStep;
        this.vy += this.ay * timeStep;
        this.x += this.vx * timeStep;
        this.y += this.vy * timeStep;
    }
}

// Initialize stars
const star1 = new Star('Star 1', 2e30, -1.5e11, 0, 0, 15e3, 'yellow'); // Example star with mass and velocity
const star2 = new Star('Star 2', 2e30, 1.5e11, 0, 0, -15e3, 'red'); // Symmetric properties for a binary orbit

// Rendering setup (using Canvas)
const canvas = document.getElementById('binarySystem');
const ctx = canvas.getContext('2d');
const scale = 1e-9; // Scale for rendering

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    [star1, star2].forEach(star => {
        ctx.beginPath();
        ctx.arc(
            canvas.width / 2 + star.x * scale,
            canvas.height / 2 + star.y * scale,
            5,
            0,
            2 * Math.PI
        );
        ctx.fillStyle = star.color;
        ctx.fill();
    });
}

// Simulation loop
function simulate() {
    // Compute forces
    star1.computeAcceleration(star2);
    star2.computeAcceleration(star1);

    // Update positions
    star1.updatePosition();
    star2.updatePosition();

    // Render
    render();

    // Request next frame
    requestAnimationFrame(simulate);
}

// Start simulation
simulate();
