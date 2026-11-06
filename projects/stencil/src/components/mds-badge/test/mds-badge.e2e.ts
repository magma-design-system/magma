import { render } from '@stencil/vitest';
import { itReadsTheSlottedLabelWhenLabelIsNull } from '@test/slot';

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

describe('mds-badge', () => {
  it('renders', async () => {
    const { root } = await render('<mds-badge></mds-badge>');

    expect(root).toHaveAttribute('hydrated');
  });

  // one variant per sheet: none, accent, status, label, and the light / dark pair
  it.each(['', 'primary', 'error', 'info', 'red', 'sky', 'light', 'dark'])(
    'is never filled with the outline tone (variant "%s")',
    async (variant) => {
      const attr = variant ? ` variant="${variant}"` : '';
      const { root } = await render(`<mds-badge tone="outline"${attr} label="Bozza"></mds-badge>`);

      expect(getComputedStyle(root).backgroundColor).toBe(TRANSPARENT);
    },
  );

  it('keeps its fill with the strong tone', async () => {
    const { root } = await render(
      '<mds-badge tone="strong" variant="error" label="Bozza"></mds-badge>',
    );

    expect(getComputedStyle(root).backgroundColor).not.toBe(TRANSPARENT);
  });

  itReadsTheSlottedLabelWhenLabelIsNull('mds-badge');
});

// #1274: a theme of one mode writes pref-theme-scheme-<mode>, and the dark refinement of the
// component turns on where the palette turns dark, whatever the mode picked
describe('mds-badge under a theme locked to one mode', () => {
  const html = document.documentElement;

  /** The box shadow of a strong badge with `classes` on <html>, the dark refinement's property. */
  const ringWith = async (...classes: string[]): Promise<string> => {
    html.classList.add(...classes);
    // the store mirrors <html> from a MutationObserver: let it run before the render reads it
    await new Promise((resolve) => setTimeout(resolve));
    const { root } = await render('<mds-badge tone="strong" label="Nuovo"></mds-badge>');
    const ring = getComputedStyle(root).boxShadow;
    html.classList.remove(...classes);
    await new Promise((resolve) => setTimeout(resolve));
    return ring;
  };

  it('takes its dark look in the light mode under a dark-only theme', async () => {
    const dark = await ringWith('pref-mode-dark', 'pref-theme-scheme-all');
    const light = await ringWith('pref-mode-light', 'pref-theme-scheme-all');

    expect(light).not.toBe(dark);
    expect(await ringWith('pref-mode-light', 'pref-theme-scheme-dark')).toBe(dark);
  });

  it('keeps its light look in the dark mode under a light-only theme', async () => {
    const light = await ringWith('pref-mode-light', 'pref-theme-scheme-all');

    expect(await ringWith('pref-mode-dark', 'pref-theme-scheme-light')).toBe(light);
  });
});
