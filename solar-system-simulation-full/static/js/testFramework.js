// Test results container
const testResults = document.createElement('div');
testResults.style.position = 'absolute';
testResults.style.top = '0';
testResults.style.left = '0';
testResults.style.padding = '10px';
testResults.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
testResults.style.color = 'white';
testResults.style.fontFamily = 'Arial, sans-serif';
testResults.style.fontSize = '14px';
testResults.style.zIndex = '10000';
document.body.appendChild(testResults);

// Utility function to add a test result to the UI
function addResult(testName, result, error = null) {
  const resultText = document.createElement('div');
  resultText.textContent = `${testName}: ${result ? '✅ Passed' : '❌ Failed'}`;
  if (!result && error) {
    const errorText = document.createElement('div');
    errorText.textContent = `Error: ${error}`;
    errorText.style.color = 'red';
    errorText.style.fontSize = '12px';
    resultText.appendChild(errorText);
  }
  testResults.appendChild(resultText);
}

// Utility function to delay between tests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Define all tests
const tests = [
  async function testFlaskServer() {
    try {
      const response = await fetch('/');
      if (response.ok) {
        addResult('Flask Server Running', true);
        return true;
      } else {
        throw new Error(`HTTP Status ${response.status}`);
      }
    } catch (error) {
      addResult('Flask Server Running', false, error.message);
      return false;
    }
  },

  function testThreeJSScene() {
    try {
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(200, 200);
      const canvas = renderer.domElement;
      if (canvas instanceof HTMLCanvasElement) {
        addResult('Three.js Renderer Initialized', true);
        return true;
      }
      throw new Error('Renderer output is not a canvas element.');
    } catch (error) {
      addResult('Three.js Renderer Initialized', false, error.message);
      return false;
    }
  },

  function testCameraSetup() {
    try {
      const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
      camera.position.z = 50;
      if (camera.position.z === 50) {
        addResult('Three.js Camera Positioned Correctly', true);
        return true;
      }
      throw new Error('Camera position is incorrect.');
    } catch (error) {
      addResult('Three.js Camera Positioned Correctly', false, error.message);
      return false;
    }
  },

  function testLighting() {
    try {
      const scene = new THREE.Scene();
      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      scene.add(ambientLight);
      if (scene.children.includes(ambientLight)) {
        addResult('Lighting Added to Scene', true);
        return true;
      }
      throw new Error('Ambient light not found in scene.');
    } catch (error) {
      addResult('Lighting Added to Scene', false, error.message);
      return false;
    }
  },

  function testPhysicsWorld() {
    try {
      const world = new CANNON.World();
      world.gravity.set(0, -9.8, 0);
      if (world.gravity.y === -9.8) {
        addResult('Physics World Initialized', true);
        return true;
      }
      throw new Error('Gravity not set correctly.');
    } catch (error) {
      addResult('Physics World Initialized', false, error.message);
      return false;
    }
  },

  function testCollisionDetection() {
    try {
      const world = new CANNON.World();
      const body1 = new CANNON.Body({ mass: 1 });
      const body2 = new CANNON.Body({ mass: 1 });
      body1.position.set(0, 0, 0);
      body2.position.set(0, 0, 0);
      world.addBody(body1);
      world.addBody(body2);

      world.step(1 / 60);

      if (world.contacts.length > 0) {
        addResult('Collision Detection Working', true);
        return true;
      }
      throw new Error('No collisions detected.');
    } catch (error) {
      addResult('Collision Detection Working', false, error.message);
      return false;
    }
  },

  async function testStaticAssets() {
    try {
      const response = await fetch('/static/css/styles.css');
      if (response.ok) {
        addResult('Static Assets Available (CSS)', true);
        return true;
      } else {
        throw new Error(`HTTP Status ${response.status}`);
      }
    } catch (error) {
      addResult('Static Assets Available (CSS)', false, error.message);
      return false;
    }
  },

  function testPerformance() {
    try {
      const stats = new Stats();
      if (stats) {
        addResult('Performance Monitoring Initialized', true);
        return true;
      }
      throw new Error('Stats.js not initialized.');
    } catch (error) {
      addResult('Performance Monitoring Initialized', false, error.message);
      return false;
    }
  },
];

// Run all tests sequentially
(async function runTests() {
  for (const test of tests) {
    try {
      await delay(500); // Add delay between tests for clarity
      await test();
    } catch (error) {
      console.error(`Error running test: ${error.message}`);
    }
  }
})();
