import { BookPoseType } from './types';

/**
 * The pose of the book, in degrees: `lay`, how far it is laid back onto its back cover (0
 * standing, 90 lying), then `turn` around the vertical axis (positive shows the spine, or spins
 * a lying book) and `tilt` around the horizontal one (negative shows the head, or the cover of
 * a lying book); `lift`, how far it has risen toward the reader, and `glare`, how much the gloss
 * of the cover shows, from 0 to 1.
 */
type BookPose = { glare: number; lay: number; lift: number; tilt: number; turn: number };

type BookAngles = Pick<BookPose, 'lay' | 'tilt' | 'turn'>;

/** The angles of each pose, after the usual shots of a book in product photography. */
const bookPoses: Record<BookPoseType, BookAngles> = {
  // standing, turned to show the spine
  spine: { lay: 0, tilt: -6, turn: 28 },
  // standing, turned the other way, to show the pages
  'fore-edge': { lay: 0, tilt: -6, turn: -28 },
  // facing the reader
  front: { lay: 0, tilt: 0, turn: 0 },
  // lying on its back, seen from above, its tail toward the reader
  lying: { lay: 90, tilt: -30, turn: 0 },
  // lying, spun on the surface to show its spine and its tail, seen from above at an angle
  'lying-turned': { lay: 90, tilt: -34, turn: 32 },
};

/** The resting pose of a pose name; a name that is not a pose rests as `spine`. */
const restPose = (pose?: string | null): BookPose => ({
  glare: 0,
  lift: 0,
  ...(Object.prototype.hasOwnProperty.call(bookPoses, pose ?? '')
    ? bookPoses[pose as BookPoseType]
    : bookPoses.spine),
});

/** How far a hover leans the book toward the pointer, from the middle to an edge, in degrees. */
const lean = { tilt: 4, turn: 6 };

/**
 * The turns a drag reaches from a resting pose: a standing book shows its spine or its pages,
 * never its back cover; a lying one spins on the surface. A drag across the whole width of the
 * book turns it by `dragPerWidth` degrees.
 */
const dragRange = (rest: BookPose): { max: number; min: number } =>
  rest.lay === 0 ? { max: 64, min: -64 } : { max: rest.turn + 70, min: rest.turn - 70 };

const dragPerWidth = 110;

/**
 * The time the pose takes to cover 63% of the way to its goal, in ms: while it follows the
 * pointer, and when it settles back after a drag or moves to another pose.
 */
const easeTime = { follow: 120, settle: 260 };

type Vector = readonly [number, number, number];

const normalize = ([x, y, z]: Vector): Vector => {
  const length = Math.hypot(x, y, z);
  return [x / length, y / length, z / length];
};

const dot = (a: Vector, b: Vector): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const radians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Toward the light, in the coordinates of CSS (y down, z toward the reader): the key light of a
 * product shot, in front of the book, above it and a little to the right, so the front cover in
 * the foreground takes the most of it and the sides a little less.
 */
const light = normalize([0.15, -0.4, 0.9]);

const rotateX = ([x, y, z]: Vector, degrees: number): Vector => {
  const angle = radians(degrees);
  return [x, y * Math.cos(angle) - z * Math.sin(angle), y * Math.sin(angle) + z * Math.cos(angle)];
};

const rotateY = ([x, y, z]: Vector, degrees: number): Vector => {
  const angle = radians(degrees);
  return [x * Math.cos(angle) + z * Math.sin(angle), y, -x * Math.sin(angle) + z * Math.cos(angle)];
};

/**
 * Where a face points once the book is posed by `rotateX(tilt) rotateY(turn) rotateX(lay)`, as
 * the stylesheet poses it.
 */
const posed = (normal: Vector, { lay, tilt, turn }: BookAngles): Vector =>
  rotateX(rotateY(rotateX(normal, lay), turn), tilt);

/** An upright face of the book, `yaw` degrees from the front cover (90 the fore edge, -90 a flat spine). */
const upright = (yaw: number): Vector => [Math.sin(radians(yaw)), 0, Math.cos(radians(yaw))];

type BookFace = 'bottom' | 'fore' | 'front' | 'spine' | 'top';

const faces: Record<BookFace, Vector> = {
  bottom: [0, 1, 0],
  fore: upright(90),
  front: upright(0),
  spine: upright(-90),
  top: [0, -1, 0],
};

/** How much light the front cover takes at rest in a pose: the reference the faces are lit from. */
const frontLight = (rest: BookAngles): number => dot(posed(faces.front, rest), light);

/**
 * How lit a face is, from -1 (in its own shadow) to 1, measured from the front cover at rest,
 * which shows the colours of its image as they are: a face turned toward the light brightens,
 * one turned away darkens.
 */
const lightOf = (normal: Vector, pose: BookAngles, reference: number): number =>
  Math.max(-1, Math.min(1, (dot(posed(normal, pose), light) - reference) * 1.4));

/** How lit each face of the book is, at a pose, from the front cover of its resting pose. */
const faceLight = (pose: BookAngles, reference: number): Record<BookFace, number> => ({
  bottom: lightOf(faces.bottom, pose, reference),
  fore: lightOf(faces.fore, pose, reference),
  front: lightOf(faces.front, pose, reference),
  spine: lightOf(faces.spine, pose, reference),
  top: lightOf(faces.top, pose, reference),
});

/** How lit each slat of a rounded spine is, from the yaw each one faces. */
const slatLight = (yaws: readonly number[], pose: BookAngles, reference: number): number[] =>
  yaws.map((yaw) => lightOf(upright(yaw), pose, reference));

/**
 * Where the reflection of the light crosses the cover, from 0 to 100: it slides across as the
 * book turns away from its resting pose, the way the gloss of a laminated cover moves in the
 * hand.
 */
const glarePosition = (turn: number, rest: BookPose, pointerX: number): number =>
  Math.max(0, Math.min(100, 50 + (turn - rest.turn) * 0.8 + pointerX * 10));

/**
 * One step of the pose toward its goal, whatever the frame rate: the share of the way covered
 * in `elapsed` ms. Close enough, it lands on the goal, so the animation can stop.
 */
const easePose = (pose: BookPose, goal: BookPose, elapsed: number, time: number): BookPose => {
  const share = 1 - Math.exp(-elapsed / time);
  const next = { ...pose };
  for (const key of Object.keys(goal) as (keyof BookPose)[]) {
    next[key] += (goal[key] - pose[key]) * share;
    // a twentieth of a degree, or of a percent of lift and gloss, is past what anyone sees
    const close = key === 'glare' || key === 'lift' ? 0.002 : 0.05;
    if (Math.abs(goal[key] - next[key]) < close) next[key] = goal[key];
  }
  return next;
};

const samePose = (a: BookPose, b: BookPose): boolean =>
  (Object.keys(a) as (keyof BookPose)[]).every((key) => a[key] === b[key]);

export type { BookFace, BookPose };
export {
  bookPoses,
  dragPerWidth,
  dragRange,
  easePose,
  easeTime,
  faceLight,
  frontLight,
  glarePosition,
  lean,
  restPose,
  samePose,
  slatLight,
};
