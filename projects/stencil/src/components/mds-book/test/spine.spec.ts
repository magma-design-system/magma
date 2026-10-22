import { hardcoverSlats, spineBulge, spineSlats } from '../meta/spine';

describe('spineSlats', () => {
  const slats = spineSlats(6, 0.14);
  const ends = (slat: { width: number; x: number; yaw: number; z: number }) => {
    const half = slat.width / 1.04 / 2;
    const facing = (slat.yaw * Math.PI) / 180;
    // along the slat, square to where it faces
    const along = { x: Math.cos(facing), z: -Math.sin(facing) };
    return [
      { x: slat.x - along.x * half, z: slat.z - along.z * half },
      { x: slat.x + along.x * half, z: slat.z + along.z * half },
    ];
  };

  it('runs from the front board to the back board', () => {
    const first = ends(slats[0]).sort((a, b) => b.z - a.z)[0];
    const last = ends(slats[slats.length - 1]).sort((a, b) => a.z - b.z)[0];

    expect(first.x).toBeCloseTo(0, 6);
    expect(first.z).toBeCloseTo(0, 6);
    expect(last.x).toBeCloseTo(0, 6);
    expect(last.z).toBeCloseTo(-1, 6);
  });

  it('bows out by the bulge in the middle, and turns from the front to the back', () => {
    const middle = Math.min(...slats.map(({ x }) => x));

    expect(middle).toBeLessThan(0);
    expect(middle).toBeGreaterThan(-0.14);
    expect(slats[0].yaw).toBeGreaterThan(-90);
    expect(slats[slats.length - 1].yaw).toBeLessThan(-90);
    expect(slats[0].yaw + 90).toBeCloseTo(-(slats[slats.length - 1].yaw + 90), 6);
  });

  it('overlaps its slats a little, so no seam shows between them', () => {
    const chords = slats.reduce((sum, { width }) => sum + width / 1.04, 0);
    const widths = slats.reduce((sum, { width }) => sum + width, 0);

    expect(widths).toBeGreaterThan(chords);
  });

  it('draws the hardcover spine with the bulge the stylesheet uses', () => {
    expect(hardcoverSlats).toEqual(spineSlats(6, spineBulge));
    expect(spineBulge).toBe(0.14);
  });
});
