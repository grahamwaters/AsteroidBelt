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
