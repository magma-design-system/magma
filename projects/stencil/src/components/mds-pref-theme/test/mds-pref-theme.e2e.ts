import { render } from '@stencil/vitest';

const CORNER_STORAGE_KEY = 'mdsPrefCornerShape';
const THEME_NAME_STORAGE_KEY = 'mdsPrefTheme';

/** The stored choice outranks the prop, and both the theme name and the corner
 * shape are written on the document, so a leftover decides the next case. */
const reset = (): void => {
  localStorage.removeItem(CORNER_STORAGE_KEY);
  document.documentElement.removeAttribute('data-corner-shape');
  localStorage.removeItem(THEME_NAME_STORAGE_KEY);
  document.documentElement.removeAttribute('data-theme-name');
  document.documentElement.style.removeProperty('--magma-pref-theme');
  // the list is live, so the names come out of a copy before they are removed
  [...document.documentElement.classList]
    .filter((name) => name.startsWith('pref-theme-'))
    .forEach((name) => document.documentElement.classList.remove(name));
};

describe('mds-pref-theme', () => {
  // the theme name and the corner shape are written on the document, so they
  // outlive this file and reach the cases that run after it: clear them on the way
  // out as well as on the way in
  afterEach(() => {
    reset();
  });

  beforeEach(() => {
    reset();
  });

  it('renders', async () => {
    const { root } = await render('<mds-pref-theme></mds-pref-theme>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('leaves the corner axis alone when no shape is asked for', async () => {
    await render('<mds-pref-theme></mds-pref-theme>');

    expect(document.documentElement).not.toHaveAttribute('data-corner-shape');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBeNull();
  });

  it('writes the deviation on the document and stores it', async () => {
    await render('<mds-pref-theme corner-shape="round"></mds-pref-theme>');

    expect(document.documentElement.getAttribute('data-corner-shape')).toBe('round');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBe('round');
  });

  it('removes the attribute for "default" instead of writing a shape', async () => {
    document.documentElement.setAttribute('data-corner-shape', 'round');

    await render('<mds-pref-theme corner-shape="default"></mds-pref-theme>');

    // freezing today's default into the page would keep a later change of default
    // from reaching a project that never chose
    expect(document.documentElement).not.toHaveAttribute('data-corner-shape');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBe('default');
  });

  it('renders no caption of its own for a theme that is not the default', async () => {
    const { root } = await render('<mds-pref-theme name="ocean"></mds-pref-theme>');

    // the dropped caption read a key none of the four locale files has, so every
    // theme but the default used to get an empty mds-text under the dropdown
    const texts = [...root.shadowRoot!.querySelectorAll('mds-text')];

    expect(root).toHaveAttribute('name', 'ocean');
    expect(texts).toHaveLength(1);
    expect(texts[0].textContent!.trim()).not.toBe('');
  });

  it('lets the stored choice outrank the prop, like the theme name does', async () => {
    localStorage.setItem(CORNER_STORAGE_KEY, 'bevel');

    await render('<mds-pref-theme corner-shape="round"></mds-pref-theme>');

    expect(document.documentElement.getAttribute('data-corner-shape')).toBe('bevel');
  });

  it('writes the theme under the theme names, never the mode ones', async () => {
    await render('<mds-pref-theme name="ocean"></mds-pref-theme>');

    const html = document.documentElement;
    expect(html).toHaveClass('pref-theme-ocean');
    expect(html.style.getPropertyValue('--magma-pref-theme')).toBe('ocean');
    expect(localStorage.getItem(THEME_NAME_STORAGE_KEY)).toBe('ocean');
    expect(html.style.getPropertyValue('--magma-pref-mode')).toBe('');
    expect(localStorage.getItem('mdsPrefMode')).toBeNull();
  });

  it.each(['dark', 'system', 'scheme-dark'])('refuses the reserved name "%s"', async (name) => {
    // a mode value would be read back as a v1 mode by the storage migration, a
    // scheme name would write a class of the scheme axis
    await render(`<mds-pref-theme name="${name}"></mds-pref-theme>`).catch(() => undefined);

    expect(document.documentElement).not.toHaveClass(`pref-theme-${name}`);
    expect(localStorage.getItem(THEME_NAME_STORAGE_KEY)).toBeNull();
  });
});
