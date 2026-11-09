import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import colors from '../../../../../styles/dist/css/colors-rgb.css?raw';
import globals from '../../../../../styles/dist/css/globals.css?raw';
import semantic from '../../../../../styles/dist/css/semantic.css?raw';

const readField = (range: HTMLElement): HTMLInputElement =>
  range.shadowRoot!.querySelector<HTMLInputElement>('input.field')!;

const readProgress = (range: HTMLElement): string =>
  range
    .shadowRoot!.querySelector<HTMLElement>('.track-progress')!
    .style.getPropertyValue('--mds-input-range-progress');

describe('mds-input-range', () => {
  it('renders', async () => {
    const { root } = await render('<mds-input-range></mds-input-range>');

    expect(root).toHaveAttribute('hydrated');
  });
});

// As on a native input, a step that is not a positive number falls back to 1 (#822)
describe('step', () => {
  it.each([
    ['', 50],
    ['value="30"', 30],
  ])('keeps a number with step="0" at load (%s)', async (attributes, expected) => {
    const { root } = await render<HTMLMdsInputRangeElement>(
      `<mds-input-range step="0" ${attributes}></mds-input-range>`,
    );

    expect(root.value).toBe(expected);
  });

  it('falls back to 1 for a step set to 0 after load', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputRangeElement>(
      '<mds-input-range value="20"></mds-input-range>',
    );

    root.step = 0;
    await waitForChanges();
    root.value = 33.4;
    await waitForChanges();

    expect(root.value).toBe(33);
  });
});

// Like a native input, a form reset brings back the value of load, thumb included (#822)
describe('form reset', () => {
  it.each([
    ['value="30"', 30],
    ['', 50],
  ])('brings back the value of load (%s)', async (attributes, expected) => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      `<form><mds-input-range name="r" ${attributes}></mds-input-range></form>`,
    );
    const range = form.querySelector('mds-input-range')!;
    readField(range).focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await waitForChanges();
    expect(range.value).toBe(expected + 2);

    form.reset();
    await waitForChanges();

    expect(range.value).toBe(expected);
    expect(readField(range).value).toBe(String(expected));
    expect(readProgress(range)).toBe(String(expected));
    expect(new FormData(form).get('r')).toBe(String(expected));
  });
});

// A disabled fieldset disables the form controls in it. It disabled the host, so the value was
// left out of the form, but not the input in its shadow root, which stayed editable (#822)
describe('in a disabled fieldset', () => {
  it('is disabled like a native range input, until the fieldset is enabled', async () => {
    const { root, waitForChanges } = await render<HTMLFormElement>(
      '<form><fieldset disabled><mds-input-range name="r" value="5"></mds-input-range></fieldset></form>',
    );
    const field = root.querySelector('mds-input-range')!;
    const native = () => field.shadowRoot!.querySelector('input')!;

    await vi.waitFor(() => expect(native().disabled).toBe(true));
    expect(new FormData(root).has('r')).toBe(false);

    root.querySelector('fieldset')!.disabled = false;
    await waitForChanges();

    expect(native().disabled).toBe(false);
    expect(new FormData(root).get('r')).toBe('5');
  });
});

// The native range input has a width of its own, 129 px in Chromium. As a flex item it did not
// shrink under it, and the implicit auto column of the host grew to it: in a narrower host the
// header and the track overflowed it (#1314)
describe('in a narrow host', () => {
  const parts = ['.header', '.range', '.track', '.field'];

  /** How far each part reaches past the right edge of its host, in px. */
  const overflow = (range: HTMLElement): Record<string, number> => {
    const right = range.getBoundingClientRect().right;
    return Object.fromEntries(
      parts.map((part) => [
        part,
        Math.max(
          0,
          Math.round(range.shadowRoot!.querySelector(part)!.getBoundingClientRect().right - right),
        ),
      ]),
    );
  };

  const inside = Object.fromEntries(parts.map((part) => [part, 0]));

  it('keeps its parts inside a host of 80 px, and ends its label in an ellipsis', async () => {
    const { root } = await render(
      '<div style="width: 80px"><mds-input-range value="40">Opacity of the surface</mds-input-range></div>',
    );
    const range = root.querySelector('mds-input-range')!;
    // the text of the label, in the shadow root of its mds-text
    const text = range
      .shadowRoot!.querySelector('.label')!
      .shadowRoot!.querySelector<HTMLElement>('.text')!;

    expect(range.getBoundingClientRect().width).toBe(80);
    expect(overflow(range)).toEqual(inside);
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    expect(getComputedStyle(text).textOverflow).toBe('ellipsis');
  });

  // a column of 1fr is as wide as the min-content of what it holds, at least
  it('shrinks to the columns of a narrow grid', async () => {
    const { root } = await render(
      `<div style="display: grid; grid-template-columns: repeat(3, 1fr); width: 240px">
        <mds-input-range>Red</mds-input-range>
        <mds-input-range>Green</mds-input-range>
        <mds-input-range>Blue</mds-input-range>
      </div>`,
    );

    for (const range of root.querySelectorAll('mds-input-range')) {
      expect(range.getBoundingClientRect().width).toBe(80);
      expect(overflow(range)).toEqual(inside);
    }
  });

  it('keeps the track as wide as the host where there is room', async () => {
    const { root } = await render(
      '<div style="width: 320px"><mds-input-range value="40">Opacity</mds-input-range></div>',
    );
    const range = root.querySelector('mds-input-range')!;
    const width = (part: string): number =>
      range.shadowRoot!.querySelector(part)!.getBoundingClientRect().width;

    expect(width('.track')).toBe(320);
    expect(width('.field')).toBe(320);
  });
});

// #1073: in dark the thumb took accent-emphasis, the colour of its ring and of the progress:
// thumb, ring and progress were one shape and the thumb could not be seen. #1141: then it took
// text-default, as light as the progress (1.61:1): over the progress it was gone again
describe('the thumb in dark', () => {
  let sheet: HTMLStyleElement | undefined;

  /** The palette of the page, in dark: the roles resolve to their dark values, not to the
   * fallbacks the components carry. The store follows <html> through a MutationObserver, so
   * give it a tick before rendering. */
  const inDark = async (): Promise<void> => {
    sheet = document.createElement('style');
    sheet.textContent = [colors, globals, semantic].join('\n');
    document.head.append(sheet);
    document.documentElement.setAttribute('data-magma-pref', '');
    document.documentElement.classList.add('pref-mode-dark');
    await new Promise((resolve) => setTimeout(resolve, 50));
  };

  afterEach(() => {
    sheet?.remove();
    document.documentElement.removeAttribute('data-magma-pref');
    document.documentElement.classList.remove('pref-mode-dark');
  });

  /** Relative luminance of an rgb() colour, as WCAG computes it. */
  const luminance = (color: string): number =>
    color
      .match(/\d+(\.\d+)?/g)!
      .slice(0, 3)
      .map((channel) => {
        const value = Number(channel) / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);

  const contrast = (a: number, b: number): number =>
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  it('stands out on the progress and its ring, and on the empty track', async () => {
    await inDark();
    const { root } = await render<HTMLMdsInputRangeElement>(
      '<mds-input-range value="18" min="14" max="24" step="2"></mds-input-range>',
    );
    const style = getComputedStyle(root);
    const read = (name: string): number => luminance(style.getPropertyValue(name));

    const thumb = read('--mds-input-range-thumb-background');
    const progress = read('--mds-input-range-track-progress-background');
    const track = read('--mds-input-range-track-background');

    expect(contrast(thumb, progress)).toBeGreaterThanOrEqual(3);
    expect(contrast(thumb, track)).toBeGreaterThanOrEqual(3);
  });

  // one rule for a handle on an accent fill: the ink of the fill
  it('takes the colour of the knob of a switch that is on', async () => {
    await inDark();
    const { root } = await render(
      '<div><mds-input-range value="18" min="14" max="24" step="2"></mds-input-range><mds-input-switch checked></mds-input-switch></div>',
    );
    // the channels: a registered property serialises with commas, an unregistered one without
    const read = (selector: string, name: string): string[] | null =>
      getComputedStyle(root.querySelector(selector)!).getPropertyValue(name).match(/\d+/g);

    expect(read('mds-input-range', '--mds-input-range-thumb-background')).toEqual(
      read('mds-input-switch', '--mds-input-switch-toggle-color-enabled-checked'),
    );
  });

  // the dark sheet came after the disabled one, with selectors of the same weight: a disabled
  // range took the colours of an enabled one in dark
  it('keeps the colours of the disabled state', async () => {
    await inDark();
    const { root } = await render<HTMLMdsInputRangeElement>(
      '<mds-input-range value="18" min="14" max="24" step="2" disabled></mds-input-range>',
    );
    const style = getComputedStyle(root);
    const read = (name: string): string => style.getPropertyValue(name);

    expect(read('--mds-input-range-thumb-background')).toBe(
      read('--mds-input-range-thumb-background-disabled'),
    );
    expect(read('--mds-input-range-track-progress-background')).toBe(
      read('--mds-input-range-track-progress-background-disabled'),
    );
  });
});
