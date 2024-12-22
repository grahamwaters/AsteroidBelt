#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Function to display messages
echo_msg() {
    echo "========================================"
    echo "$1"
    echo "========================================"
}

# Check for Python 3
if ! command -v python3 &> /dev/null
then
    echo_msg "Python3 could not be found. Please install Python3 before running this script."
    exit
fi

# Check for pip
if ! command -v pip &> /dev/null
then
    echo_msg "pip could not be found. Please install pip before running this script."
    exit
fi

# Define project name
PROJECT_NAME="solar-system-simulation"

# Create project directory
if [ -d "$PROJECT_NAME" ]; then
    echo_msg "Directory '$PROJECT_NAME' already exists. Skipping creation."
else
    echo_msg "Creating project directory '$PROJECT_NAME'."
    mkdir "$PROJECT_NAME"
fi

cd "$PROJECT_NAME"

# Create virtual environment
if [ -d "venv" ]; then
    echo_msg "Virtual environment 'venv' already exists. Skipping creation."
else
    echo_msg "Creating Python virtual environment."
    python3 -m venv venv
fi

# Activate virtual environment
echo_msg "Activating virtual environment."
source venv/bin/activate

# Upgrade pip
echo_msg "Upgrading pip."
pip install --upgrade pip

# Create requirements.txt
echo_msg "Creating 'requirements.txt'."
cat > requirements.txt << EOL
Flask==2.3.2
EOL

# Install Python dependencies
echo_msg "Installing Python dependencies."
pip install -r requirements.txt

# Create directory structure
echo_msg "Creating directory structure."
mkdir -p static/css
mkdir -p static/js
mkdir -p templates

# Create app.py
echo_msg "Creating 'app.py'."
cat > app.py << 'EOL'
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
EOL

# Create templates/index.html
echo_msg "Creating 'templates/index.html'."
cat > templates/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Solar System Formation Simulation</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <div id="container"></div>

    <!-- Three.js Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <!-- Cannon.js Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js"></script>
    <!-- OrbitControls.js -->
    <script src="https://threejs.org/examples/js/controls/OrbitControls.js"></script>
    <!-- Main JavaScript -->
    <script src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>
EOL

# Create static/css/style.css
echo_msg "Creating 'static/css/style.css'."
cat > static/css/style.css << 'EOL'
body, html {
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background-color: #000;
}

#container {
    width: 100%;
    height: 100%;
}
EOL

# Create static/js/main.js
echo_msg "Creating 'static/js/main.js'."
cat > static/js/main.js << 'EOL'
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
EOL

# Make the script executable and run it
# (Not necessary here, but for user info)
echo_msg "Setup complete."

echo "To activate the virtual environment, run 'source venv/bin/activate'."
echo "To start the Flask application, run 'python app.py' inside the project directory."
