import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import colors from '../../../../../styles/dist/css/colors-rgb.css?raw';
import globals from '../../../../../styles/dist/css/globals.css?raw';
import semantic from '../../../../../styles/dist/css/semantic.css?raw';
import typography from '../../../../../styles/dist/css/typography.css?raw';

describe('mds-input-switch', () => {
  const setup = async (html: string) => {
    const { root, waitForChanges } = await render<HTMLMdsInputSwitchElement>(html);
    const shadow = root.shadowRoot!;
    return {
      root,
      waitForChanges,
      input: shadow.querySelector<HTMLInputElement>('input.field')!,
      control: shadow.querySelector<HTMLElement>('.switch-container, .label-icon')!,
    };
  };

  it('renders', async () => {
    const { root } = await render('<mds-input-switch></mds-input-switch>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('exposes the native input as the labelled control, the label only draws it', async () => {
    const { input, control } = await setup('<mds-input-switch>Notifications</mds-input-switch>');

    expect(input).toEqualAttributes({ role: 'switch', 'aria-label': 'Select Notifications' });
    // `aria-label` is prohibited on a label, and two tab stops would announce the control twice
    expect(control).not.toHaveAttribute('aria-label');
    expect(control).not.toHaveAttribute('tabindex');
  });

  it('keeps the native checkbox and radio semantics', async () => {
    const { input } = await setup('<mds-input-switch type="checkbox"></mds-input-switch>');

    expect(input).not.toHaveAttribute('role');
    expect(input).toEqualAttributes({ type: 'checkbox', 'aria-label': 'Select element' });
  });

  it('toggles from the keyboard through the focused input', async () => {
    const { root, input, waitForChanges } = await setup(
      '<mds-input-switch>Notifications</mds-input-switch>',
    );

    input.focus();
    expect(root.shadowRoot!.activeElement).toBe(input);

    await userEvent.keyboard(' ');
    await waitForChanges();
    expect(root).toHaveAttribute('checked');
    expect(input).toEqualAttribute('aria-label', 'Deselect Notifications');

    await userEvent.keyboard('{Enter}');
    await waitForChanges();
    expect(root).not.toHaveAttribute('checked');
  });

  it('toggles when the drawn switch is clicked', async () => {
    const { root, control, waitForChanges } = await setup(
      '<mds-input-switch>Notifications</mds-input-switch>',
    );

    await userEvent.click(control);
    await waitForChanges();

    expect(root).toHaveAttribute('checked');
  });
});

describe('the knob', () => {
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
  });

  /** The background of an element once its 200ms transition has landed. */
  const settledBackground = async (element: Element): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let previous = '';
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const current = getComputedStyle(element).backgroundColor;
      if (current === previous) return current;
      previous = current;
    }
    return previous;
  };

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

  const knobAndTrack = async (host: HTMLElement): Promise<{ knob: number; track: number }> => ({
    knob: luminance(await settledBackground(host.shadowRoot!.querySelector('.switch-toggle')!)),
    track: luminance(await settledBackground(host.shadowRoot!.querySelector('.switch')!)),
  });

  it('is lighter than the track when the switch is off, in dark as in light', async () => {
    // in dark the off knob took the fill ink, which is the page colour: a dark dot on a grey
    // track, that read as a hole in it rather than as the handle
    await inDark();
    const { root } = await render<HTMLMdsInputSwitchElement>(
      '<mds-input-switch></mds-input-switch>',
    );

    const { knob, track } = await knobAndTrack(root);

    expect(knob).toBeGreaterThan(track);
  });

  it('stays dark on the light accent track when the switch is on, in dark', async () => {
    // a light knob on accent-emphasis, a light blue in dark, would get 1.61:1
    await inDark();
    const { root } = await render<HTMLMdsInputSwitchElement>(
      '<mds-input-switch checked></mds-input-switch>',
    );

    const { knob, track } = await knobAndTrack(root);

    expect(knob).toBeLessThan(track);
  });

  it.each([
    { state: 'enabled', markup: '<mds-input-switch explicit></mds-input-switch>' },
    { state: 'disabled', markup: '<mds-input-switch explicit disabled></mds-input-switch>' },
  ])(
    'shows the glyph of an off $state explicit switch on its light knob, in dark',
    async ({ markup }) => {
      // the glyph took text roles, which are light in dark: invisible once the knob is light too
      await inDark();
      const { root } = await render<HTMLMdsInputSwitchElement>(markup);
      const knob = luminance(
        await settledBackground(root.shadowRoot!.querySelector('.switch-toggle')!),
      );
      const glyph = luminance(
        getComputedStyle(root.shadowRoot!.querySelector('.icon-explicit')!).fill,
      );

      const [lighter, darker] = [knob, glyph].sort((a, b) => b - a);
      expect((lighter + 0.05) / (darker + 0.05)).toBeGreaterThanOrEqual(3);
    },
  );

  it('casts its shadow on a consumer page', async () => {
    // #1000: it read `var(--shadow)`, which only Tailwind's theme declares and never emits, so
    // the knob computed to no shadow at all
    sheet = document.createElement('style');
    sheet.textContent = [typography, globals].join('\n');
    document.head.append(sheet);
    const { root } = await render<HTMLMdsInputSwitchElement>(
      '<mds-input-switch></mds-input-switch>',
    );

    expect(getComputedStyle(root.shadowRoot!.querySelector('.switch-toggle')!).boxShadow).not.toBe(
      'none',
    );
  });

  it('has the same colour before the first toggle and after toggling back', async () => {
    // only the rule of a toggled switch painted the knob unchecked: until the first change it
    // had the colour of a checked one
    const { root, waitForChanges } = await render<HTMLMdsInputSwitchElement>(
      '<mds-input-switch></mds-input-switch>',
    );
    const knob = root.shadowRoot!.querySelector('.switch-toggle')!;
    const atLoad = await settledBackground(knob);

    await clickSwitch(root);
    await waitForChanges();
    await clickSwitch(root);
    await waitForChanges();

    expect(root).not.toHaveAttribute('checked');
    expect(await settledBackground(knob)).toBe(atLoad);
  });
});

// The knob slides on a change of checked, and is already in its place when the switch is
// shown, on load or again after being hidden. Its place was the last frame of the slide, which
// ran again every time the switch appeared (#924)
describe('the knob motion', () => {
  const frame = (): Promise<number> => new Promise((resolve) => requestAnimationFrame(resolve));

  const knobOf = (host: HTMLElement): HTMLElement =>
    host.shadowRoot!.querySelector<HTMLElement>('.switch-toggle')!;

  /** The slides running on the knob: a finished one still holds its last frame, it does not count. */
  const slides = (host: HTMLElement): string[] =>
    knobOf(host)
      .getAnimations()
      .filter((animation) => animation.playState === 'running')
      .map((animation) => (animation as CSSAnimation).animationName);

  /** Fails as soon as the knob slides, in any of the next frames. */
  const staysStill = async (host: HTMLElement, frames = 30): Promise<void> => {
    for (let count = 0; count < frames; count += 1) {
      expect(slides(host)).toEqual([]);
      await frame();
    }
  };

  /** How far the knob is from the start of the track, in widths of the knob: 0 off, 1 on. */
  const place = (host: HTMLElement): number => {
    const knob = knobOf(host);
    return Math.round(new DOMMatrix(getComputedStyle(knob).transform).m41 / knob.offsetWidth);
  };

  const landed = async (host: HTMLElement): Promise<void> => {
    await vi.waitFor(() => expect(slides(host)).toEqual([]));
  };

  it.each([
    { state: 'off', markup: '<mds-input-switch></mds-input-switch>', expected: 0 },
    { state: 'on', markup: '<mds-input-switch checked></mds-input-switch>', expected: 1 },
  ])('is in its place on load when $state, without sliding there', async ({ markup, expected }) => {
    const { root } = await render<HTMLMdsInputSwitchElement>(markup);

    await staysStill(root);
    expect(place(root)).toBe(expected);
  });

  it.each([
    { state: 'on since load', clicks: 0, expected: 1 },
    { state: 'switched off by the user', clicks: 2, expected: 0 },
  ])(
    'is still in its place when shown again after being hidden, $state',
    async ({ clicks, expected }) => {
      const { root, waitForChanges } = await render<HTMLElement>(
        `<div><mds-input-switch${expected ? ' checked' : ''}></mds-input-switch></div>`,
      );
      const host = root.querySelector('mds-input-switch')!;
      for (let count = 0; count < clicks; count += 1) {
        await clickSwitch(host);
        await waitForChanges();
        await landed(host);
      }

      root.style.display = 'none';
      await staysStill(host, 5);
      root.style.display = '';

      await staysStill(host);
      expect(place(host)).toBe(expected);
    },
  );

  it.each([
    {
      how: 'a click',
      toggle: async (host: HTMLMdsInputSwitchElement) => clickSwitch(host),
    },
    {
      how: 'the keyboard',
      toggle: async (host: HTMLMdsInputSwitchElement) => {
        host.shadowRoot!.querySelector('input')!.focus();
        await userEvent.keyboard(' ');
      },
    },
    {
      how: 'code',
      toggle: async (host: HTMLMdsInputSwitchElement) => {
        host.checked = !host.checked;
      },
    },
  ])('slides on and off by $how, and rests in the place of its state', async ({ toggle }) => {
    const { root, waitForChanges } = await render<HTMLMdsInputSwitchElement>(
      '<mds-input-switch></mds-input-switch>',
    );

    await toggle(root);
    await waitForChanges();
    await vi.waitFor(() => expect(slides(root)).toEqual(['check']));
    await landed(root);
    expect(place(root)).toBe(1);

    await toggle(root);
    await waitForChanges();
    await vi.waitFor(() => expect(slides(root)).toEqual(['uncheck']));
    await landed(root);
    expect(place(root)).toBe(0);
  });

  it('does not take up again a slide cut short by hiding the switch', async () => {
    const { root, waitForChanges } = await render<HTMLElement>(
      '<div><mds-input-switch></mds-input-switch></div>',
    );
    const host = root.querySelector('mds-input-switch')!;
    host.checked = true;
    await waitForChanges();
    await vi.waitFor(() => expect(slides(host)).toEqual(['check']));

    root.style.display = 'none';
    await staysStill(host, 5);
    root.style.display = '';

    await staysStill(host);
    expect(place(host)).toBe(1);
  });

  it('finishes the second slide of a quick double toggle', async () => {
    const { root, waitForChanges } = await render<HTMLMdsInputSwitchElement>(
      '<mds-input-switch></mds-input-switch>',
    );

    root.checked = true;
    await waitForChanges();
    root.checked = false;
    await waitForChanges();

    await vi.waitFor(() => expect(slides(root)).toEqual(['uncheck']));
    await landed(root);
    expect(place(root)).toBe(0);
  });
});

const clickSwitch = async (element: HTMLElement): Promise<void> => {
  await userEvent.click(
    element.shadowRoot!.querySelector<HTMLElement>('.switch-container, .label-icon')!,
  );
};

const setupForm = async (html: string) => {
  const { root, waitForChanges } = await render<HTMLElement>(html);
  const form = root.tagName === 'FORM' ? (root as HTMLFormElement) : root.querySelector('form')!;
  const switches = Array.from(root.querySelectorAll('mds-input-switch'));
  return { root, form, switches, waitForChanges };
};

// Like a native checkbox, a form reset brings back the checked state of load (#822)
describe('form reset', () => {
  it('brings back the checked state of load and submits accordingly', async () => {
    const { form, switches, waitForChanges } = await setupForm(
      '<form><mds-input-switch name="news" value="yes"></mds-input-switch><mds-input-switch name="terms" value="ok" checked></mds-input-switch></form>',
    );
    const [news, terms] = switches;
    await clickSwitch(news);
    await clickSwitch(terms);
    await waitForChanges();
    expect(new FormData(form).get('news')).toBe('yes');
    expect(new FormData(form).has('terms')).toBe(false);

    form.reset();
    await waitForChanges();

    expect(news).not.toHaveAttribute('checked');
    expect(terms).toHaveAttribute('checked');
    expect(terms.shadowRoot!.querySelector('input')!.checked).toBe(true);
    const data = new FormData(form);
    expect(data.has('news')).toBe(false);
    expect(data.get('terms')).toBe('ok');
  });
});

// Like native radios, a group submits the one checked (#822)
describe('radio group', () => {
  const radios = (name: string) =>
    ['a', 'b', 'c']
      .map(
        (value) =>
          `<mds-input-switch type="radio" name="${name}" value="${value}"></mds-input-switch>`,
      )
      .join('');

  it('submits only the radio checked last', async () => {
    const { form, switches, waitForChanges } = await setupForm(`<form>${radios('r')}</form>`);

    await clickSwitch(switches[0]);
    await clickSwitch(switches[1]);
    await waitForChanges();

    expect(switches[0]).not.toHaveAttribute('checked');
    expect(new FormData(form).getAll('r')).toEqual(['b']);
  });

  it('unchecks the others for a radio checked by code', async () => {
    const { form, switches, waitForChanges } = await setupForm(`<form>${radios('r')}</form>`);
    await clickSwitch(switches[0]);

    switches[2].checked = true;
    await waitForChanges();

    expect(switches[0]).not.toHaveAttribute('checked');
    expect(new FormData(form).getAll('r')).toEqual(['c']);
  });

  it('leaves alone the radios without a name and the other switches', async () => {
    const { switches, waitForChanges } = await setupForm(
      '<div><mds-input-switch type="radio" value="a"></mds-input-switch><mds-input-switch type="radio" value="b"></mds-input-switch><mds-input-switch type="checkbox" checked></mds-input-switch></div>',
    );
    const [a, b, checkbox] = switches;

    await clickSwitch(a);
    await clickSwitch(b);
    await waitForChanges();

    expect(a).toHaveAttribute('checked');
    expect(b).toHaveAttribute('checked');
    expect(checkbox).toHaveAttribute('checked');
  });

  it('keeps a group per form', async () => {
    const { switches, waitForChanges } = await setupForm(
      `<div><form>${radios('r')}</form><form>${radios('r')}</form></div>`,
    );

    await clickSwitch(switches[0]);
    await clickSwitch(switches[4]);
    await waitForChanges();

    expect(switches[0]).toHaveAttribute('checked');
    expect(switches[4]).toHaveAttribute('checked');
  });
});

// The form value follows the state set by code too, not only the clicks (#822)
describe('form value', () => {
  it('follows checked, value and disabled set by code', async () => {
    const { form, switches, waitForChanges } = await setupForm(
      '<form><mds-input-switch name="news" value="yes"></mds-input-switch></form>',
    );
    const [news] = switches;

    news.checked = true;
    await waitForChanges();
    expect(new FormData(form).get('news')).toBe('yes');

    news.value = 'weekly';
    await waitForChanges();
    expect(new FormData(form).get('news')).toBe('weekly');

    news.disabled = true;
    await waitForChanges();
    news.disabled = false;
    await waitForChanges();
    expect(new FormData(form).get('news')).toBe('weekly');
  });
});

// A disabled fieldset disables the form controls in it. It disabled the host, so the value was
// left out of the form, but not the input in its shadow root, which stayed editable (#822)
describe('in a disabled fieldset', () => {
  it('is disabled like a native checkbox, until the fieldset is enabled', async () => {
    const { root, waitForChanges } = await render<HTMLFormElement>(
      '<form><fieldset disabled><mds-input-switch name="news" value="yes" checked></mds-input-switch></fieldset></form>',
    );
    const field = root.querySelector('mds-input-switch')!;
    const native = () => field.shadowRoot!.querySelector('input')!;

    await vi.waitFor(() => expect(native().disabled).toBe(true));
    expect(getComputedStyle(field).pointerEvents).toBe('none');
    expect(new FormData(root).has('news')).toBe(false);

    root.querySelector('fieldset')!.disabled = false;
    await waitForChanges();

    expect(native().disabled).toBe(false);
    expect(new FormData(root).get('news')).toBe('yes');
  });
});
