import { commands } from 'vitest/browser';

type Scheme = 'light' | 'dark';

declare module 'vitest/browser' {
  interface BrowserCommands {
    // defined in vitest.config.mts, run in Node
    compileTailwind: (css: string) => Promise<string>;
    emulateColorScheme: (scheme: Scheme | null) => Promise<void>;
  }
}

/**
 * A Tailwind `dark:` utility follows the Magma mode, as the palette does (#1100), not the OS
 * alone: the Tailwind entry of the styles package (`dist/tailwind/theme.css`) brings the
 * variant. The probe is an arbitrary property, so what flips is the variant, not a colour.
 */
describe('the dark: variant of the Tailwind theme', () => {
  const html = document.documentElement;
  const utility = 'dark:[--dark-variant:on]';
  let css: string;
  let sheet: HTMLStyleElement;
  let probe: HTMLElement;

  /** Whether the utility applies to `element` on an OS in `os`, with `classes` on <html>. */
  const appliedWith = async (os: Scheme, classes: string[], element?: HTMLElement) => {
    await commands.emulateColorScheme(os);
    html.classList.add(...classes);
    return getComputedStyle(element ?? probe).getPropertyValue('--dark-variant') === 'on';
  };

  beforeAll(async () => {
    css = await commands.compileTailwind(
      [
        "@import 'tailwindcss/theme.css' layer(theme);",
        "@import '@maggioli-design-system/styles/dist/tailwind/theme.css';",
        `@source inline('${utility}');`,
        '@tailwind utilities source(none);',
      ].join('\n'),
    );
  });

  beforeEach(() => {
    sheet = document.createElement('style');
    sheet.textContent = css;
    document.head.append(sheet);
    probe = document.createElement('div');
    probe.className = utility;
    document.body.append(probe);
    // a page with a controller (mds-pref writes it): the OS decides only in system mode
    html.setAttribute('data-magma-pref', '');
  });

  afterEach(async () => {
    sheet.remove();
    probe.remove();
    html.removeAttribute('data-magma-pref');
    html.classList.remove(utility);
    await commands.emulateColorScheme(null);
  });

  it('compiles on the Magma mode, not on the OS alone', () => {
    expect(css).toContain('.pref-mode-dark');
  });

  it('applies under pref-mode-dark on a light OS', async () => {
    expect(await appliedWith('light', ['pref-mode-dark'])).toBe(true);
  });

  it('does not apply under pref-mode-light on a dark OS', async () => {
    expect(await appliedWith('dark', ['pref-mode-light'])).toBe(false);
  });

  it.each<[Scheme, boolean]>([
    ['light', false],
    ['dark', true],
  ])('follows a %s OS under pref-mode-system', async (os, applied) => {
    expect(await appliedWith(os, ['pref-mode-system'])).toBe(applied);
  });

  it.each<[Scheme, boolean]>([
    ['light', false],
    ['dark', true],
  ])('follows a %s OS with no preference at all', async (os, applied) => {
    html.removeAttribute('data-magma-pref');

    expect(await appliedWith(os, [])).toBe(applied);
  });

  it.each<[Scheme, string]>([
    ['light', 'pref-mode-dark'],
    ['dark', 'pref-mode-system'],
  ])('never applies under a theme locked to light (%s OS, %s)', async (os, mode) => {
    expect(await appliedWith(os, ['pref-theme-scheme-light', mode])).toBe(false);
  });

  it('applies under a theme locked to dark, whatever the mode', async () => {
    expect(await appliedWith('light', ['pref-theme-scheme-dark', 'pref-mode-light'])).toBe(true);
  });

  it('applies to the root element too', async () => {
    html.classList.add(utility);

    expect(await appliedWith('light', ['pref-mode-dark'], html)).toBe(true);
  });
});
