#!/usr/bin/env bash

# Stop script on error
set -e

# Name of the project directory
PROJECT_DIR="solar-system-simulation"

#########################
# 1) Create Directories #
#########################
echo "Creating directories..."

mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/templates"
mkdir -p "$PROJECT_DIR/static"
mkdir -p "$PROJECT_DIR/static/css"
mkdir -p "$PROJECT_DIR/static/js"
mkdir -p "$PROJECT_DIR/static/assets/textures"

echo "Directories created."

####################################
# 2) Populate Python Files (Flask) #
####################################
echo "Creating Python files..."

cat << EOF > "$PROJECT_DIR/app.py"
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
EOF

cat << EOF > "$PROJECT_DIR/requirements.txt"
Flask==2.2.5
EOF

echo "Python files created."

####################################
# 3) Populate HTML and CSS Files   #
####################################
echo "Creating HTML and CSS files..."

# templates/index.html
cat << 'EOF' > "$PROJECT_DIR/templates/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Modular Solar System</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='css/styles.css') }}">
</head>
<body>
  <div id="container"></div>

  <!-- Three.js Library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- OrbitControls for interactivity -->
  <script src="https://threejs.org/examples/js/controls/OrbitControls.js"></script>
  <!-- Stats.js for performance monitoring -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js"></script>

  <!-- Main JavaScript (Entry Point) -->
  <script type="module" src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>
EOF

# static/css/styles.css
cat << 'EOF' > "$PROJECT_DIR/static/css/styles.css"
/* Basic Resets */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: Arial, sans-serif;
  background-color: #000;
}

/* Container for 3D Scene */
#container {
  width: 100vw;
  height: 100vh;
  position: relative;
}

/* Info Panel */
#infoPanel {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 5px;
  max-width: 200px;
  opacity: 0; /* default hidden */
  transition: opacity 0.5s ease;
}

/* Speed Indicator */
#speedIndicator {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 5px 10px;
  background-color: rgba(0,0,0,0.7);
  color: #fff;
  border-radius: 5px;
  font-size: 14px;
}

/* Stats.js (positioned top-left by default) */
#stats {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
}
EOF

echo "HTML and CSS files created."

###################################
# 4) Populate JavaScript Modules  #
###################################
echo "Creating JS files..."

# static/js/config.js
cat << 'EOF' > "$PROJECT_DIR/static/js/config.js"
export const CONFIG = {
  CAMERA: {
    fov: 75,
    near: 0.1,
    far: 1000,
    initialPosition: { x: 0, y: 50, z: 100 },
  },

  LIGHTS: {
    ambientColor: 0x333333,
    ambientIntensity: 1.0,
    pointColor: 0xffffff,
    pointIntensity: 1.5,
    pointPosition: { x: 0, y: 0, z: 0 },
  },

  PLANETS: {
    minCount: 5,
    maxCount: 10,
    minDistance: 10,
    minDistanceBetweenPlanets: 5,
    planetSizeRange: { min: 1, max: 3 },
    moonSizeRange: { min: 0.2, max: 0.7 },
    maxMoonsPerPlanet: 3,
  },

  ASTEROIDS: {
    count: 500,
    beltInner: 30,
    beltOuter: 40,
    sizeRange: { min: 0.1, max: 0.4 },
  },

  SPEED: {
    minSpeed: 0.1,
    maxSpeed: 5,
    initial: 1,
  },

  UI: {
    infoPanelFadeDuration: 500,
    infoPanelVisibleTime: 3000,
  },
};
EOF

# static/js/scene.js
cat << 'EOF' > "$PROJECT_DIR/static/js/scene.js"
import { CONFIG } from './config.js';
import { initControls, updateControls } from './controls.js';
import { stats } from './ui.js';

let scene, camera, renderer;

export function initScene() {
  // Create scene
  scene = new THREE.Scene();

  // Create camera
  const { fov, near, far, initialPosition } = CONFIG.CAMERA;
  camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
  camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').appendChild(renderer.domElement);

  // Listen for window resize
  window.addEventListener('resize', onWindowResize);

  // Initialize controls
  initControls(camera, renderer);

  return { scene, camera, renderer };
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

export function animate(updateCallback) {
  requestAnimationFrame(() => animate(updateCallback));
  stats.begin();

  // Custom update logic (planets, asteroids, etc.)
  updateCallback();

  // Update controls & render
  updateControls();
  renderer.render(scene, camera);

  stats.end();
}
EOF

# static/js/celestial.js
cat << 'EOF' > "$PROJECT_DIR/static/js/celestial.js"
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
EOF

# static/js/asteroidBelt.js
cat << 'EOF' > "$PROJECT_DIR/static/js/asteroidBelt.js"
import { CONFIG } from './config.js';

let instancedAsteroids;
let asteroidAngles = [];
let asteroidSpeeds = [];
let dummy = new THREE.Object3D();

export function createAsteroidBelt(scene) {
  const { count, beltInner, beltOuter } = CONFIG.ASTEROIDS;
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0x888888 });

  instancedAsteroids = new THREE.InstancedMesh(geometry, material, count);

  for (let i = 0; i < count; i++) {
    const distance = Math.random() * (beltOuter - beltInner) + beltInner;
    const angle = Math.random() * Math.PI * 2;
    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);

    dummy.position.set(x, 0, z);
    dummy.updateMatrix();
    instancedAsteroids.setMatrixAt(i, dummy.matrix);

    const speed = Math.random() * 0.002 + 0.001;
    asteroidSpeeds.push(speed);
    asteroidAngles.push(angle);
  }

  scene.add(instancedAsteroids);
}

export function updateAsteroidBelt(simulationSpeed) {
  const { count, beltInner, beltOuter } = CONFIG.ASTEROIDS;

  for (let i = 0; i < count; i++) {
    asteroidAngles[i] += asteroidSpeeds[i] * simulationSpeed;

    const distance = beltInner + (beltOuter - beltInner) * (i / count);
    const x = distance * Math.cos(asteroidAngles[i]);
    const z = distance * Math.sin(asteroidAngles[i]);

    dummy.position.set(x, 0, z);
    dummy.updateMatrix();
    instancedAsteroids.setMatrixAt(i, dummy.matrix);
  }

  instancedAsteroids.instanceMatrix.needsUpdate = true;
}
EOF

# static/js/controls.js
cat << 'EOF' > "$PROJECT_DIR/static/js/controls.js"
import { CONFIG } from './config.js';
import { displayInfo } from './ui.js';

let controls;
let camera;
let renderer;
let raycaster;
let mouse;
let clickableObjects = [];

export let simulationSpeed = CONFIG.SPEED.initial;

export function initControls(cam, rend) {
  camera = cam;
  renderer = rend;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 20;
  controls.maxDistance = 300;
  controls.maxPolarAngle = Math.PI / 2;

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('click', onMouseClick);
  window.addEventListener('keydown', onKeyDown);
}

export function registerClickableObjects(...objects) {
  clickableObjects.push(...objects);
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects, true);
  if (intersects.length > 0) {
    displayInfo(intersects[0].object);
  }
}

function onKeyDown(event) {
  const { minSpeed, maxSpeed } = CONFIG.SPEED;
  switch (event.key) {
    case '+':
    case '=':
      simulationSpeed *= 1.1;
      if (simulationSpeed > maxSpeed) simulationSpeed = maxSpeed;
      break;
    case '-':
    case '_':
      simulationSpeed /= 1.1;
      if (simulationSpeed < minSpeed) simulationSpeed = minSpeed;
      break;
    case '0':
      simulationSpeed = 1;
      break;
    // Additional interactions:
    // case 'n':
    //   // e.g., Add a new planet
    //   break;
    default:
      break;
  }
}

export function updateControls() {
  controls.update();
}
EOF

# static/js/ui.js
cat << 'EOF' > "$PROJECT_DIR/static/js/ui.js"
import { CONFIG } from './config.js';

export const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

let infoPanel;
let fadeTimeout;

export function initUI() {
  infoPanel = document.createElement('div');
  infoPanel.id = 'infoPanel';
  document.body.appendChild(infoPanel);

  // Speed indicator
  const speedIndicator = document.createElement('div');
  speedIndicator.id = 'speedIndicator';
  speedIndicator.textContent = \`Speed: \${CONFIG.SPEED.initial}x\`;
  document.body.appendChild(speedIndicator);
}

export function displayInfo(object) {
  clearTimeout(fadeTimeout);
  infoPanel.style.opacity = '1';

  infoPanel.innerHTML = \`<strong>\${object.name}</strong><br/>\`;
  // Additional info: For a real simulation, you'd parse
  // object data or look it up in an array of planet data:
  infoPanel.innerHTML += \`Object ID: \${object.id}<br/>\`;

  fadeTimeout = setTimeout(() => {
    infoPanel.style.opacity = '0';
  }, CONFIG.UI.infoPanelVisibleTime);
}

export function updateSpeedIndicator(speed) {
  const speedIndicator = document.getElementById('speedIndicator');
  if (speedIndicator) {
    speedIndicator.textContent = \`Speed: \${speed.toFixed(1)}x\`;
  }
}
EOF

# static/js/animations.js
cat << 'EOF' > "$PROJECT_DIR/static/js/animations.js"
// Example animations file
// Potentially integrate a library like GSAP or custom transitions

export function fadeIn(element, duration = 500) {
  element.style.transition = \`opacity \${duration}ms ease\`;
  element.style.opacity = '1';
}

export function fadeOut(element, duration = 500) {
  element.style.transition = \`opacity \${duration}ms ease\`;
  element.style.opacity = '0';
}
EOF

# static/js/main.js
cat << 'EOF' > "$PROJECT_DIR/static/js/main.js"
import { initScene, animate } from './scene.js';
import { CONFIG } from './config.js';
import { createSun, generatePlanets, createMoonsForPlanets } from './celestial.js';
import { createAsteroidBelt, updateAsteroidBelt } from './asteroidBelt.js';
import { initUI, updateSpeedIndicator } from './ui.js';
import { initControls, registerClickableObjects, simulationSpeed } from './controls.js';

let planets = [];

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  initUI();

  // Initialize scene
  const { scene } = initScene();

  // Create the sun
  const sun = createSun(scene);

  // Generate planets
  planets = generatePlanets(scene);

  // Create moons
  createMoonsForPlanets(planets);

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

  // Start animation
  animate(() => {
    // Update planet orbits
    planets.forEach(planet => {
      planet.pivot.rotation.y += planet.speed * simulationSpeed;
      if (planet.moons) {
        planet.moons.forEach(moon => {
          moon.pivot.rotation.y += moon.speed * simulationSpeed;
        });
      }
    });

    // Update asteroids
    updateAsteroidBelt(simulationSpeed);

    // Update speed indicator
    updateSpeedIndicator(simulationSpeed);
  });
});
EOF

echo "JavaScript files created."

#####################
# 5) Create README  #
#####################
cat << 'EOF' > "$PROJECT_DIR/README.md"
# Solar System Simulation

This project is a modular solar system simulation using:
- **Python Flask** (for serving the web page)
- **Three.js** (for 3D rendering)
- **Stats.js** (for performance monitoring)

## Features
- **Sun, Planets, Moons** with randomized orbits
- **Asteroid Belt** with InstancedMesh for performance
- **Configurable Speed** with keyboard controls (+/-/0)
- **Click Interaction**: Displays object info in a panel
- **Responsive & Animated** UI with fade-in/fade-out
- **Modular Code** for easier maintenance

## Setup & Run

1. **Install Python Dependencies:**

   ```bash
   pip install -r requirements.txt
