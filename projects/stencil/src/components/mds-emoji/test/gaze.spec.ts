import { gazeReach, gazeToward } from '../meta/gaze';

// #800: the gaze used to divide the pointer offset by half the size of the emoji and clamp
// each axis on its own, so the pose depended on the size and collapsed onto eight poses.

const angle = ({ x, y }: { x: number; y: number }): number => (Math.atan2(y, x) * 180) / Math.PI;
const length = ({ x, y }: { x: number; y: number }): number => Math.hypot(x, y);
const toward = (degrees: number, distance: number) => {
  const radians = (degrees * Math.PI) / 180;
  return [Math.cos(radians) * distance, Math.sin(radians) * distance] as const;
};

describe('gazeToward', () => {
  it('looks in the direction of the point, at any distance', () => {
    for (const degrees of [0, 20, 45, 70, 90, 135, -160])
      for (const distance of [10, 200, 450, 3000])
        expect(angle(gazeToward(...toward(degrees, distance), 450))).toBeCloseTo(degrees, 6);
  });

  it('keeps far points apart: 20 and 70 degrees below to the right are two poses, not one corner', () => {
    const shallow = gazeToward(...toward(20, 2000), 450);
    const steep = gazeToward(...toward(70, 2000), 450);

    expect(angle(shallow)).toBeCloseTo(20, 6);
    expect(angle(steep)).toBeCloseTo(70, 6);
    // saturated on the length of the vector, never on the corner of the box (length 1.41)
    expect(length(shallow)).toBeCloseTo(1, 6);
    expect(length(steep)).toBeCloseTo(1, 6);
    expect(Math.max(...[shallow, steep].flatMap(({ x, y }) => [x, y]))).toBeLessThan(1);
  });

  it('grows with the distance up to the reach, and stops there', () => {
    const at = (distance: number) => length(gazeToward(...toward(30, distance), 400));

    expect(at(100)).toBeCloseTo(0.25, 6);
    expect(at(200)).toBeCloseTo(0.5, 6);
    expect(at(400)).toBeCloseTo(1, 6);
    expect(at(4000)).toBeCloseTo(1, 6);
  });

  it('looks straight ahead at the centre, and with no reach', () => {
    expect(gazeToward(0, 0, 400)).toEqual({ x: 0, y: 0 });
    expect(gazeToward(30, 40, 0)).toEqual({ x: 0, y: 0 });
    expect(gazeToward(30, 40, Number.NaN)).toEqual({ x: 0, y: 0 });
  });
});

describe('gazeReach', () => {
  it('is half the short side of the viewport, with no size of the emoji in it', () => {
    expect(gazeReach(1440, 900)).toBe(450);
    expect(gazeReach(390, 844)).toBe(195);
  });
});
