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
