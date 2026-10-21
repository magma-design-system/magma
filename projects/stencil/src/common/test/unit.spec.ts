import { cssDurationToSeconds } from '@common/unit';

describe('cssDurationToSeconds', () => {
  it('reads seconds and milliseconds', () => {
    expect(cssDurationToSeconds('0.3s')).toBe(0.3);
    expect(cssDurationToSeconds(' 300ms')).toBe(0.3);
  });

  // an empty computed style used to turn the durations of mds-emoji into 1000 seconds
  it('falls back to one second, or to the default it is given, on a value without a unit', () => {
    expect(cssDurationToSeconds('')).toBe(1);
    expect(cssDurationToSeconds('', 0.2)).toBe(0.2);
  });
});
