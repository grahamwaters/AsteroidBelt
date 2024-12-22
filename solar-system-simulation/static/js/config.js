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
