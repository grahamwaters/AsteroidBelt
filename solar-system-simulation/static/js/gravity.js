// Apply Newtonian gravity between two bodies
export function applyGravity(body1, body2, G = 6.67430e-11) {
    const distance = body1.position.vsub(body2.position).length();
    const forceMagnitude = (G * body1.mass * body2.mass) / (distance * distance);

    const force = body2.position.vsub(body1.position).normalize().scale(forceMagnitude);
    body1.applyForce(force, body1.position);
    body2.applyForce(force.negate(), body2.position);
  }
