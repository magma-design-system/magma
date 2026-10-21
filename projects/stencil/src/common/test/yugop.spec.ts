import RandomText from '@common/yugop';

describe('RandomText', () => {
  /** Frames queued with requestAnimationFrame, run one at a time by the test. */
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    frames = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** Runs the queued frames until none is left or `limit` have run; returns how many ran. */
  const runFrames = (limit: number): number => {
    let ran = 0;
    while (frames.length > 0 && ran < limit) {
      frames.shift()!(ran);
      ran += 1;
    }
    return ran;
  };

  it.each([0, -1])('reaches the text with a speed of %s', (speed) => {
    // no character ever started with a speed of 0, so the loop kept scheduling a frame forever
    const onComplete = vi.fn();
    new RandomText({ str: 'Copied', speed, onComplete }).start();

    runFrames(1000);

    expect(onComplete).toHaveBeenCalledWith('Copied');
    expect(frames).toHaveLength(0);
  });

  it('keeps a positive speed', () => {
    expect(new RandomText({ str: 'Copied', speed: 0.5 }).speed).toBe(0.5);
  });
});
