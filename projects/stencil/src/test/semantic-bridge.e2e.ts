import colors from '../../../styles/dist/css/colors-rgb.css?raw';
import globals from '../../../styles/dist/css/globals.css?raw';
import semantic from '../../../styles/dist/css/semantic.css?raw';
import bridge from '../../../styles/dist/tailwind/semantic.css?raw';

/**
 * The Tailwind bridge of the semantic layer writes every role with its light default as the
 * fallback of its var(): `--color-surface-default: rgb(var(--magma-surface-default, 242 242
 * 242))`. Tailwind IntelliSense reads the colour of a utility only from that literal, so the
 * fallback is what the editor shows next to `bg-surface-default`. It has to be the colour the
 * role really has on a light page, or the swatch lies.
 */
describe('the fallbacks of the semantic Tailwind bridge', () => {
  const html = document.documentElement;
  let sheet: HTMLStyleElement;

  const roles = [...bridge.matchAll(/rgb\(var\(--(magma-[a-z0-9-]+), (\d+ \d+ \d+)\)\)/g)].map(
    ([, role, fallback]) => ({ role, fallback }),
  );

  beforeEach(() => {
    sheet = document.createElement('style');
    sheet.textContent = [colors, globals, semantic].join('\n');
    document.head.append(sheet);
    // a light page with a controller: no OS preference can switch the mode
    html.setAttribute('data-magma-pref', '');
    html.classList.add('pref-mode-light');
  });

  afterEach(() => {
    sheet.remove();
    html.removeAttribute('data-magma-pref');
  });

  it('gives every role of the bridge a fallback', () => {
    const declared = bridge.match(/^\s*--color-[a-z0-9-]+:/gm) ?? [];

    expect(roles.length).toBeGreaterThan(100);
    expect(roles).toHaveLength(declared.length);
  });

  it('falls back to the colour each role has on a light page', () => {
    const probe = document.createElement('div');
    document.body.append(probe);
    const colourOf = (value: string): string => {
      probe.style.color = value;
      return getComputedStyle(probe).color;
    };

    const wrong = roles
      .map(({ role, fallback }) => ({
        role,
        fallback: colourOf(`rgb(${fallback})`),
        page: colourOf(`rgb(var(--${role}))`),
      }))
      .filter(({ fallback, page }) => fallback !== page);
    probe.remove();

    expect(wrong).toEqual([]);
  });
});
