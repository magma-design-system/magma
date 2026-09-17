import { generateRandomCharCodeArray, charCodeArrayToString } from './core';
import { noop } from './utils/noop';

type Options = {
  str: string;
  speed?: number;
  placeholderChar?: string;
  frameOffset?: number;
  charOffset?: number;
  charStep?: number;
  minCharCode?: number;
  maxCharCode?: number;
  onProgress?: (arg0: string) => void;
  onComplete?: (arg0: string) => void;
};

class RandomText {
  static defaults: Options = {
    str: '',
    speed: 2,
    placeholderChar: '_',
    frameOffset: 30,
    charOffset: 20,
    charStep: 10,
    minCharCode: 32,
    maxCharCode: 122,
    onProgress: noop,
    onComplete: noop,
  };
  str: string;
  speed: number;
  placeholderChar: string;
  frameOffset: number;
  charOffset: number;
  charStep: number;
  minCharCode: number;
  maxCharCode: number;
  onProgress: (...args: Array<string>) => string;
  onComplete: (...args: Array<string>) => string;
  rafId: number; // TODO: should be #rafId for private

  constructor(options: Options) {
    Object.assign(this, { ...RandomText.defaults, ...options });
  }

  start = (): void => {
    const { frameOffset, charOffset, str, speed } = this;
    const randoms = generateRandomCharCodeArray(frameOffset, charOffset)(str);
    this.stop();
    this.rafId = requestAnimationFrame(() => {
      this.step(randoms, speed, speed);
    });
  };

  stop(): void {
    cancelAnimationFrame(this.rafId);
  }

  /**
   * Every frame advances the first `stepCount` characters towards their target and leaves
   * the rest where they are. The whole array is mapped, not a `slice` of it: a character
   * that has not started yet is still far from its target, so it comes out as the
   * placeholder instead of coming out as nothing. The string therefore has its final
   * length from the very first frame, which is what keeps the box from collapsing - an
   * output of zero characters has no line box at all, and everything around it jumps.
   */
  step(randoms: number[], stepCount: number, speed: number): void {
    const { str, charStep, minCharCode, maxCharCode, placeholderChar, onProgress, onComplete } =
      this;
    const steppedArray = randoms.map((item, index) => {
      if (index >= stepCount) return item;
      if (item > 0) return item - 1;
      if (item < 0) return item + 1;
      return 0;
    });
    const output = charCodeArrayToString({
      str,
      minCharCode,
      maxCharCode,
      placeholderChar,
      charStep,
    })(steppedArray);
    const updatedRandoms = steppedArray;
    onProgress(output);

    if (output !== str) {
      this.rafId = requestAnimationFrame(() => {
        this.step(updatedRandoms, stepCount + speed, speed);
      });
    } else {
      onComplete(output);
    }
  }
}

export default RandomText;
