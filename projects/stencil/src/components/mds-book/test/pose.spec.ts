import {
  bookPoses,
  dragRange,
  easePose,
  faceLight,
  frontLight,
  glarePosition,
  restPose,
  samePose,
} from '../meta/pose';

describe('restPose', () => {
  it('rests at the angles of the pose, without gloss or lift', () => {
    expect(restPose('lying')).toEqual({ glare: 0, lift: 0, ...bookPoses.lying });
  });

  it('rests as spine on no pose, or one that is not a pose', () => {
    for (const pose of [undefined, null, '', 'upside-down', 'constructor']) {
      expect(restPose(pose)).toEqual(restPose('spine'));
    }
  });
});

describe('faceLight', () => {
  it('leaves the front cover of every pose at rest as its image', () => {
    for (const name of Object.keys(bookPoses)) {
      const rest = restPose(name);

      expect(faceLight(rest, frontLight(rest)).front).toBeCloseTo(0, 6);
    }
  });

  it('darkens the front and brightens the spine as a standing book turns to show it', () => {
    const rest = restPose('spine');
    const reference = frontLight(rest);
    const turned = faceLight({ ...rest, turn: 64 }, reference);

    expect(turned.front).toBeLessThan(0);
    expect(turned.spine).toBeGreaterThan(turned.front);
  });

  it('turns the light to the pages when the book turns the other way', () => {
    const rest = restPose('spine');
    const reference = frontLight(rest);

    expect(faceLight({ ...rest, turn: -64 }, reference).fore).toBeGreaterThan(
      faceLight(rest, reference).fore,
    );
  });

  it('lights the tail of a lying book, which faces the reader, and not its head', () => {
    const rest = restPose('lying');
    const lights = faceLight(rest, frontLight(rest));

    expect(lights.bottom).toBeGreaterThan(lights.top);
  });

  it('keeps every face between -1 and 1', () => {
    for (let turn = -90; turn <= 90; turn += 15) {
      for (const value of Object.values(faceLight({ lay: 45, tilt: -30, turn }, 0))) {
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('dragRange', () => {
  it('never turns a standing book as far as its back cover', () => {
    expect(dragRange(restPose('spine'))).toEqual({ max: 64, min: -64 });
    expect(dragRange(restPose('front'))).toEqual({ max: 64, min: -64 });
  });

  it('spins a lying book around its pose', () => {
    const rest = restPose('lying-turned');

    expect(dragRange(rest)).toEqual({ max: rest.turn + 70, min: rest.turn - 70 });
  });
});

describe('glarePosition', () => {
  it('crosses the middle of the cover at rest, and slides as the book turns', () => {
    const rest = restPose('spine');

    expect(glarePosition(rest.turn, rest, 0)).toBe(50);
    expect(glarePosition(rest.turn + 20, rest, 0)).toBeGreaterThan(50);
    expect(glarePosition(rest.turn - 20, rest, 0)).toBeLessThan(50);
  });

  it('stays on the cover at the ends of a drag', () => {
    const rest = restPose('spine');

    expect(glarePosition(64, rest, 1)).toBeLessThanOrEqual(100);
    expect(glarePosition(-64, rest, -1)).toBeGreaterThanOrEqual(0);
  });
});

describe('easePose', () => {
  const goal = { glare: 1, lay: 90, lift: 1, tilt: -30, turn: 60 };

  it('covers the same share of the way in the same time, whatever the frame rate', () => {
    let at60 = restPose('spine');
    for (let frame = 0; frame < 6; frame++) at60 = easePose(at60, goal, 1000 / 60, 120);
    let at30 = restPose('spine');
    for (let frame = 0; frame < 3; frame++) at30 = easePose(at30, goal, 1000 / 30, 120);

    expect(at30.turn).toBeCloseTo(at60.turn, 6);
    expect(at30.lay).toBeCloseTo(at60.lay, 6);
  });

  it('lands on its goal, so the animation can stop', () => {
    let pose = restPose('spine');
    for (let frame = 0; frame < 300 && !samePose(pose, goal); frame++) {
      pose = easePose(pose, goal, 1000 / 60, 120);
    }

    expect(pose).toEqual(goal);
  });
});
