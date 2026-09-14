import { render } from '@stencil/vitest';

const CORNER_STORAGE_KEY = 'mdsPrefCornerShape';

describe('mds-pref-theme-variant', () => {
  beforeEach(() => {
    // the stored choice outranks the prop, so a leftover from another test would
    // decide this one
    localStorage.removeItem(CORNER_STORAGE_KEY);
    document.documentElement.removeAttribute('data-corner-shape');
  });

  it('renders', async () => {
    const { root } = await render('<mds-pref-theme-variant></mds-pref-theme-variant>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('leaves the corner axis alone when no shape is asked for', async () => {
    await render('<mds-pref-theme-variant></mds-pref-theme-variant>');

    expect(document.documentElement).not.toHaveAttribute('data-corner-shape');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBeNull();
  });

  it('writes the deviation on the document and stores it', async () => {
    await render('<mds-pref-theme-variant corner-shape="round"></mds-pref-theme-variant>');

    expect(document.documentElement.getAttribute('data-corner-shape')).toBe('round');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBe('round');
  });

  it('removes the attribute for "default" instead of writing a shape', async () => {
    document.documentElement.setAttribute('data-corner-shape', 'round');

    await render('<mds-pref-theme-variant corner-shape="default"></mds-pref-theme-variant>');

    // freezing today's default into the page would keep a later change of default
    // from reaching a project that never chose
    expect(document.documentElement).not.toHaveAttribute('data-corner-shape');
    expect(localStorage.getItem(CORNER_STORAGE_KEY)).toBe('default');
  });

  it('lets the stored choice outrank the prop, like the theme name does', async () => {
    localStorage.setItem(CORNER_STORAGE_KEY, 'bevel');

    await render('<mds-pref-theme-variant corner-shape="round"></mds-pref-theme-variant>');

    expect(document.documentElement.getAttribute('data-corner-shape')).toBe('bevel');
  });
});
