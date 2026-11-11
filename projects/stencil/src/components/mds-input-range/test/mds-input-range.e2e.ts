import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { useLanguage } from '@test/language';
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

// Several values on one track, an mds-input-range-value child each (#1261)
describe('several values', () => {
  const thumbs = (range: HTMLElement): HTMLInputElement[] =>
    Array.from(range.shadowRoot!.querySelectorAll<HTMLInputElement>('input.field'));
  const thumbValues = (range: HTMLElement): number[] =>
    thumbs(range).map((input) => Number(input.value));
  const names = (range: HTMLElement): (string | null)[] =>
    thumbs(range).map((input) => input.getAttribute('aria-label'));
  const header = (range: HTMLElement): string =>
    range.shadowRoot!.querySelector('.value')!.textContent ?? '';
  const values = (range: HTMLElement): (number | undefined)[] =>
    Array.from(range.querySelectorAll('mds-input-range-value')).map((value) => value.value);

  const price = `<form>
    <mds-input-range min="0" max="100" name="prezzo">
      Prezzo
      <mds-input-range-value value="20">Minimo</mds-input-range-value>
      <mds-input-range-value value="80">Massimo</mds-input-range-value>
    </mds-input-range>
  </form>`;

  const renderPrice = async () => {
    const result = await render<HTMLFormElement>(price);
    const range = result.root.querySelector('mds-input-range')!;
    await vi.waitFor(() => expect(thumbs(range)).toHaveLength(2));
    return { ...result, form: result.root, range };
  };

  /** Presses keys on the thumb at `index`, as a person does: focus, then the keyboard. */
  const press = async (range: HTMLElement, index: number, keys: string): Promise<void> => {
    thumbs(range)[index].focus();
    await userEvent.keyboard(keys);
  };

  describe('the thumbs', () => {
    it('draws a thumb per value, named by its text, in a group named by the label', async () => {
      const { range } = await renderPrice();

      expect(thumbValues(range)).toEqual([20, 80]);
      expect(names(range)).toEqual(['Minimo', 'Massimo']);
      expect(range.shadowRoot!.querySelector('[role="group"]')).toEqualAttribute(
        'aria-label',
        'Prezzo',
      );
      // the values are data: their text stays out of the label
      for (const value of range.querySelectorAll('mds-input-range-value')) {
        expect(getComputedStyle(value).display).toBe('none');
      }
    });

    it('reads the values in order of value, each with the name of its own child', async () => {
      const { root } = await render(
        `<mds-input-range>
          Prezzo
          <mds-input-range-value value="80">Massimo</mds-input-range-value>
          <mds-input-range-value value="20">Minimo</mds-input-range-value>
        </mds-input-range>`,
      );

      expect(thumbValues(root)).toEqual([20, 80]);
      expect(names(root)).toEqual(['Minimo', 'Massimo']);
    });

    it('brings a value outside min and max, or off the step, inside, and writes it back', async () => {
      const { root } = await render(
        `<mds-input-range min="0" max="10" step="2">
          <mds-input-range-value value="15"></mds-input-range-value>
          <mds-input-range-value value="-3"></mds-input-range-value>
          <mds-input-range-value value="4.6"></mds-input-range-value>
        </mds-input-range>`,
      );

      expect(thumbValues(root)).toEqual([0, 4, 10]);
      await vi.waitFor(() => expect(values(root)).toEqual([10, 0, 4]));
    });

    it('starts a value without a value in the middle of the range, as a native input', async () => {
      const { root } = await render(
        '<mds-input-range min="0" max="50"><mds-input-range-value></mds-input-range-value></mds-input-range>',
      );

      expect(thumbValues(root)).toEqual([25]);
    });

    it('fills the track from the first thumb to the last', async () => {
      const { root } = await render(
        `<div style="width: 320px">
          <mds-input-range>
            <mds-input-range-value value="20"></mds-input-range-value>
            <mds-input-range-value value="80"></mds-input-range-value>
          </mds-input-range>
        </div>`,
      );
      const range = root.querySelector('mds-input-range')!;
      const track = range.shadowRoot!.querySelector('.track-total')!.getBoundingClientRect();
      const fill = range.shadowRoot!.querySelector('.track-progress')!.getBoundingClientRect();
      // the centre of a thumb travels the track less one thumb, which is as large as the track
      const centre = (percent: number): number =>
        track.left + track.height / 2 + (track.width - track.height) * (percent / 100);

      expect(fill.left).toBeCloseTo(centre(20), 0);
      expect(fill.right).toBeCloseTo(centre(80), 0);
    });
  });

  describe('the accessible name of a thumb without text', () => {
    describe('in Italian', () => {
      useLanguage('it');

      it('is the label and the position of the thumb', async () => {
        const { root } = await render(
          `<mds-input-range>
            Prezzo
            <mds-input-range-value value="20"></mds-input-range-value>
            <mds-input-range-value value="80"></mds-input-range-value>
          </mds-input-range>`,
        );

        expect(names(root)).toEqual(['Prezzo, 1 di 2', 'Prezzo, 2 di 2']);
      });

      it('is the position alone without a label', async () => {
        const { root } = await render(
          `<mds-input-range>
            <mds-input-range-value value="20"></mds-input-range-value>
            <mds-input-range-value value="80">Massimo</mds-input-range-value>
          </mds-input-range>`,
        );

        expect(names(root)).toEqual(['1 di 2', 'Massimo']);
      });
    });

    describe('in English', () => {
      useLanguage('en');

      it('is the label and the position of the thumb', async () => {
        const { root } = await render(
          `<mds-input-range>
            Price
            <mds-input-range-value value="20"></mds-input-range-value>
            <mds-input-range-value value="80"></mds-input-range-value>
          </mds-input-range>`,
        );

        expect(names(root)).toEqual(['Price, 1 of 2', 'Price, 2 of 2']);
      });
    });
  });

  describe('the keyboard', () => {
    const small = `<mds-input-range min="0" max="10">
      <mds-input-range-value value="3">Minimo</mds-input-range-value>
      <mds-input-range-value value="5">Massimo</mds-input-range-value>
    </mds-input-range>`;

    it('moves the thumb with the focus with the arrows, up to its neighbour, not past it', async () => {
      const { root, waitForChanges } = await render(small);

      await press(root, 0, '{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}');
      await waitForChanges();
      expect(thumbValues(root)).toEqual([5, 5]);

      await press(root, 0, '{ArrowLeft}{ArrowDown}');
      await waitForChanges();
      expect(thumbValues(root)).toEqual([3, 5]);

      await press(root, 1, '{ArrowUp}');
      await waitForChanges();
      expect(thumbValues(root)).toEqual([3, 6]);
      expect(values(root)).toEqual([3, 6]);
    });

    it('sends Home and End to the neighbours and to the ends of the range', async () => {
      const { root, waitForChanges } = await render(small);

      await press(root, 0, '{End}');
      await waitForChanges();
      expect(thumbValues(root)).toEqual([5, 5]);

      await press(root, 0, '{Home}');
      await press(root, 1, '{End}');
      await waitForChanges();
      expect(thumbValues(root)).toEqual([0, 10]);

      await press(root, 1, '{Home}');
      await waitForChanges();
      expect(thumbValues(root)).toEqual([0, 0]);
    });

    it('moves a tenth of the range with Page Up and Page Down, within the neighbours', async () => {
      const { root, waitForChanges } = await render(
        `<mds-input-range>
          <mds-input-range-value value="20"></mds-input-range-value>
          <mds-input-range-value value="25"></mds-input-range-value>
        </mds-input-range>`,
      );

      await press(root, 0, '{PageUp}');
      await waitForChanges();
      expect(thumbValues(root)).toEqual([25, 25]);

      await press(root, 0, '{PageDown}');
      await press(root, 1, '{PageUp}');
      await waitForChanges();
      expect(thumbValues(root)).toEqual([15, 35]);
    });

    // a thumb is --spacing(600) wide, and a step of 0.5 on 1..21 is less than half of it
    it('keeps the thumb with the focus on top of a neighbour, and moves it alone', async () => {
      const { root, waitForChanges } = await render(
        `<div style="width: 360px">
          <mds-input-range min="1" max="21" step="0.5">
            <mds-input-range-value value="3"></mds-input-range-value>
            <mds-input-range-value value="3.5"></mds-input-range-value>
          </mds-input-range>
        </div>`,
      );
      const range = root.querySelector('mds-input-range')!;
      /** The thumb the pointer finds at the centre of the thumb at `index`. */
      const topAt = (index: number): HTMLInputElement => {
        const input = thumbs(range)[index];
        const box = input.getBoundingClientRect();
        const size = range
          .shadowRoot!.querySelector('.track-total')!
          .getBoundingClientRect().height;
        const ratio = (Number(input.value) - 1) / 20;
        const x = box.left + size / 2 + (box.width - size) * ratio;
        return range.shadowRoot!.elementFromPoint(x, box.top + box.height / 2) as HTMLInputElement;
      };

      await press(range, 1, '{ArrowLeft}{ArrowLeft}');
      await waitForChanges();
      expect(thumbValues(range)).toEqual([3, 3]);
      expect(topAt(1)).toBe(thumbs(range)[1]);

      await press(range, 0, '{ArrowLeft}');
      await waitForChanges();
      expect(thumbValues(range)).toEqual([2.5, 3]);
      expect(topAt(0)).toBe(thumbs(range)[0]);
    });
  });

  describe('the pointer', () => {
    it('moves the nearest thumb to a press on the track', async () => {
      const { root, waitForChanges } = await render(
        `<div style="width: 320px">
          <mds-input-range>
            <mds-input-range-value value="20"></mds-input-range-value>
            <mds-input-range-value value="80"></mds-input-range-value>
          </mds-input-range>
        </div>`,
      );
      const range = root.querySelector('mds-input-range')!;
      const track = range.shadowRoot!.querySelector<HTMLElement>('.track-total')!;
      const { height, width } = track.getBoundingClientRect();
      const at = (value: number) => ({
        position: { x: height / 2 + (width - height) * (value / 100), y: height / 2 },
      });

      await userEvent.click(track, at(70));
      await waitForChanges();
      expect(thumbValues(range)).toEqual([20, 70]);

      await userEvent.click(track, at(40));
      await waitForChanges();
      expect(thumbValues(range)).toEqual([40, 70]);
    });
  });

  describe('the form', () => {
    it('gets an entry per value under name, in order, as a native select multiple', async () => {
      const { form, range, waitForChanges } = await renderPrice();
      expect(new FormData(form).getAll('prezzo')).toEqual(['20', '80']);

      await press(range, 0, '{ArrowRight}');
      await waitForChanges();

      expect(new FormData(form).getAll('prezzo')).toEqual(['21', '80']);
    });

    it('brings back the values of load on a reset', async () => {
      const { form, range, waitForChanges } = await renderPrice();
      await press(range, 0, '{End}');
      await press(range, 1, '{End}');
      await waitForChanges();
      expect(thumbValues(range)).toEqual([80, 100]);

      form.reset();
      await waitForChanges();

      expect(thumbValues(range)).toEqual([20, 80]);
      expect(values(range)).toEqual([20, 80]);
      expect(new FormData(form).getAll('prezzo')).toEqual(['20', '80']);
      expect(header(range)).toBe('20 \u2013 80');
    });

    it('leaves the values out while disabled, and gets them back once enabled', async () => {
      const { form, range, waitForChanges } = await renderPrice();

      range.disabled = true;
      await waitForChanges();
      expect(new FormData(form).has('prezzo')).toBe(false);
      expect(thumbs(range).every((input) => input.disabled)).toBe(true);

      range.disabled = false;
      await waitForChanges();
      expect(new FormData(form).getAll('prezzo')).toEqual(['20', '80']);
    });
  });

  describe('the change', () => {
    it('emits mdsInputRangeValuesChange with the values in order, not mdsInputRangeChange', async () => {
      const { range, spyOnEvent, waitForChanges } = await renderPrice();
      const valuesSpy = spyOnEvent('mdsInputRangeValuesChange');
      const valueSpy = spyOnEvent('mdsInputRangeChange');

      await press(range, 1, '{ArrowLeft}');
      await waitForChanges();

      expect(valuesSpy).toHaveReceivedEventTimes(1);
      expect(valuesSpy).toHaveReceivedEventDetail({ values: [20, 79] });
      expect(valueSpy).toHaveReceivedEventTimes(0);
    });

    it('is not emitted for the values of load, nor for a key that moves nothing', async () => {
      const received: unknown[] = [];
      const listener = (event: Event) => received.push((event as CustomEvent).detail);
      document.addEventListener('mdsInputRangeValuesChange', listener);
      try {
        const { range, waitForChanges } = await renderPrice();
        await press(range, 1, '{End}{End}');
        await waitForChanges();

        expect(received).toEqual([{ values: [20, 100] }]);
      } finally {
        document.removeEventListener('mdsInputRangeValuesChange', listener);
      }
    });
  });

  describe('the children', () => {
    it('adds a thumb for a value added, and takes it away with the value removed', async () => {
      const { form, range, spyOnEvent } = await renderPrice();
      const valuesSpy = spyOnEvent('mdsInputRangeValuesChange');
      const middle = document.createElement('mds-input-range-value');
      middle.setAttribute('value', '50');
      middle.textContent = 'Medio';

      range.append(middle);

      await vi.waitFor(() => expect(thumbValues(range)).toEqual([20, 50, 80]));
      expect(names(range)).toEqual(['Minimo', 'Medio', 'Massimo']);
      expect(new FormData(form).getAll('prezzo')).toEqual(['20', '50', '80']);
      expect(valuesSpy).toHaveReceivedEventDetail({ values: [20, 50, 80] });

      middle.remove();

      await vi.waitFor(() => expect(thumbValues(range)).toEqual([20, 80]));
      expect(new FormData(form).getAll('prezzo')).toEqual(['20', '80']);
      expect(valuesSpy).toHaveReceivedEventDetail({ values: [20, 80] });
    });

    it('moves a thumb when its value is set from code', async () => {
      const { range } = await renderPrice();

      range.querySelectorAll('mds-input-range-value')[1].value = 60;

      await vi.waitFor(() => expect(thumbValues(range)).toEqual([20, 60]));
      expect(header(range)).toBe('20 \u2013 60');
    });

    it('goes back to the one value of the range once the last child is removed', async () => {
      const { root: form } = await render<HTMLFormElement>(
        `<form><mds-input-range name="r" value="30">
          <mds-input-range-value value="70">Valore</mds-input-range-value>
        </mds-input-range></form>`,
      );
      const range = form.querySelector('mds-input-range')!;
      expect(thumbValues(range)).toEqual([70]);
      expect(new FormData(form).getAll('r')).toEqual(['70']);

      range.querySelector('mds-input-range-value')!.remove();

      await vi.waitFor(() => expect(new FormData(form).getAll('r')).toEqual(['30']));
      expect(thumbValues(range)).toEqual([30]);
      expect(range.value).toBe(30);
    });
  });

  describe('the header', () => {
    it('shows two values as an interval and more as a list, formatted as one value', async () => {
      const { range } = await renderPrice();
      expect(header(range)).toBe('20 \u2013 80');

      const { root, waitForChanges } = await render<HTMLMdsInputRangeElement>(
        `<mds-input-range min="1" max="21" step="0.5">
          <mds-input-range-value value="3"></mds-input-range-value>
          <mds-input-range-value value="4.5"></mds-input-range-value>
          <mds-input-range-value value="7"></mds-input-range-value>
          <mds-input-range-value value="12"></mds-input-range-value>
        </mds-input-range>`,
      );
      expect(header(root)).toBe('3 \u00b7 4.5 \u00b7 7 \u00b7 12');

      root.formatValue = (value) => value.toFixed(1);
      await waitForChanges();
      expect(header(root)).toBe('3.0 \u00b7 4.5 \u00b7 7.0 \u00b7 12.0');
      expect(thumbs(root)[1]).toEqualAttribute('aria-valuetext', '4.5');
    });
  });
});

// The one value, without children: what #1261 added around it
describe('one value', () => {
  it('names its formatted value for assistive technology', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputRangeElement>(
      '<mds-input-range value="40"></mds-input-range>',
    );

    root.formatValue = (value) => `${value} %`;
    await waitForChanges();

    expect(readField(root)).toEqualAttribute('aria-valuetext', '40 %');
  });

  // a disabled range left the form, and stayed out of it once enabled again
  it('gets back into the form once enabled again', async () => {
    const { root: form, waitForChanges } = await render<HTMLFormElement>(
      '<form><mds-input-range name="r" value="30"></mds-input-range></form>',
    );
    const range = form.querySelector('mds-input-range')!;

    range.disabled = true;
    await waitForChanges();
    expect(new FormData(form).has('r')).toBe(false);

    range.disabled = false;
    await waitForChanges();
    expect(new FormData(form).get('r')).toBe('30');
  });
});
