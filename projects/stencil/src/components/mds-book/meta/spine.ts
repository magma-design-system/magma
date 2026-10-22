/**
 * A slat of a rounded spine: where its middle is (`x` across, toward the spine side when
 * negative, `z` in depth, from the front cover at 0 to the back cover at -1) and how wide it is,
 * in units of the depth of the book, and where it faces, in degrees from the front cover (a flat
 * spine faces -90).
 */
type SpineSlat = { width: number; x: number; yaw: number; z: number };

/**
 * The slats that draw a rounded spine: an arc of a circle from the front board to the back
 * board, bowed out by `bulge` (a share of the depth) in the middle. Each slat is the chord of
 * its stretch of the arc, a little wider so that no seam shows between two of them, and faces
 * outward from the centre of the circle, which is what lights each one differently.
 */
const spineSlats = (count: number, bulge: number): SpineSlat[] => {
  const radius = (0.25 + bulge * bulge) / (2 * bulge);
  const centre = radius - bulge;
  const half = Math.asin(0.5 / radius);
  const point = (angle: number) => ({
    x: centre - radius * Math.cos(angle),
    z: -0.5 + radius * Math.sin(angle),
  });
  return Array.from({ length: count }, (_, index) => {
    const from = half - (2 * half * index) / count;
    const to = half - (2 * half * (index + 1)) / count;
    const start = point(from);
    const end = point(to);
    const middle = (from + to) / 2;
    return {
      width: Math.hypot(start.x - end.x, start.z - end.z) * 1.04,
      x: (start.x + end.x) / 2,
      yaw: (Math.atan2(-Math.cos(middle), Math.sin(middle)) * 180) / Math.PI,
      z: (start.z + end.z) / 2,
    };
  });
};

/** How far the spine of a hardcover bows out, as a share of the depth of the book. */
const spineBulge = 0.14;

/** The slats of the spine of a hardcover. */
const hardcoverSlats = spineSlats(6, spineBulge);

export type { SpineSlat };
export { hardcoverSlats, spineBulge, spineSlats };
