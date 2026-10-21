/**
 * Where the emoji looks, as the two signed fractions `rotate()` takes, in -1..1.
 *
 * The direction is the direction of the point from the centre of the emoji, and nothing
 * else: the size of the emoji does not enter it. The intensity grows with the distance up
 * to `reach` and stops there on the length of the vector, so a far point keeps its angle.
 * Dividing each axis by half the size of the emoji and clamping it on its own (#800) made
 * a small emoji saturate at once, and turned every far point into one of eight poses: a
 * point at 20 degrees and one at 70 degrees below and to the right looked the same.
 */
export const gazeToward = (dx: number, dy: number, reach: number): { x: number; y: number } => {
  const distance = Math.hypot(dx, dy);
  if (distance === 0 || !(reach > 0)) return { x: 0, y: 0 };
  const intensity = Math.min(distance / reach, 1);
  return { x: (dx / distance) * intensity, y: (dy / distance) * intensity };
};

/**
 * How far the point has to be for the emoji to turn all the way: half the short side of the
 * viewport, whatever the size of the emoji.
 */
export const gazeReach = (viewportWidth: number, viewportHeight: number): number =>
  Math.min(viewportWidth, viewportHeight) / 2;
