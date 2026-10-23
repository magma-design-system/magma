/**
 * A slat of a rounded spine: where its middle is (`x` across, toward the spine side when
 * negative, `z` in depth, from the front cover at 0 to the back cover at -1) and how wide it is,
 * in units of the depth of the book, and where it faces, in degrees from the front cover (a flat
 * spine faces -90).
 */
type SpineSlat = { width: number; x: number; yaw: number; z: number };

/**
 * The arc of a rounded spine: a circle through the edges of the two boards, bowed out by
 * `bulge` (a share of the depth) in the middle, cut into `count` stretches. `angle` gives where
 * each stretch ends on the circle, counted from the front board, and `point` where that is, in
 * the units of a slat.
 */
const spineArc = (count: number, bulge: number) => {
  const radius = (0.25 + bulge * bulge) / (2 * bulge);
  const centre = radius - bulge;
  const half = Math.asin(0.5 / radius);
  return {
    angle: (index: number) => half - (2 * half * index) / count,
    point: (angle: number) => ({
      x: centre - radius * Math.cos(angle),
      z: -0.5 + radius * Math.sin(angle),
    }),
  };
};

/**
 * The slats that draw a rounded spine (see spineArc). Each slat is the chord of its stretch of
 * the arc, a little wider so that no seam shows between two of them, and faces outward from the
 * centre of the circle, which is what lights each one differently.
 */
const spineSlats = (count: number, bulge: number): SpineSlat[] => {
  const { angle, point } = spineArc(count, bulge);
  return Array.from({ length: count }, (_, index) => {
    const from = angle(index);
    const to = angle(index + 1);
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

/**
 * The cap over an end of a rounded spine, as the clip-path of its box: the bulge across (0% at
 * its outermost, 100% on the edges of the boards), the depth down (from the front board, or from
 * the back one: the arc reads the same both ways). Its edge runs through the ends of the slats,
 * so the cap follows the spine and never reaches past it.
 */
const spineCap = (count: number, bulge: number): string => {
  const { angle, point } = spineArc(count, bulge);
  const share = (value: number) => `${(value * 100).toFixed(3)}%`;
  const corners = Array.from({ length: count + 1 }, (_, index) => {
    const { x, z } = point(angle(index));
    return `${share(1 + x / bulge)} ${share(-z)}`;
  });
  return `polygon(${corners.join(', ')})`;
};

/** How far the spine of a hardcover bows out, as a share of the depth of the book. */
const spineBulge = 0.14;

/** The slats of the spine of a hardcover. */
const hardcoverSlats = spineSlats(6, spineBulge);

/** The caps over the ends of the spine of a hardcover, on the same arc as its slats. */
const hardcoverCap = spineCap(6, spineBulge);

export type { SpineSlat };
export { hardcoverCap, hardcoverSlats, spineBulge, spineCap, spineSlats };
