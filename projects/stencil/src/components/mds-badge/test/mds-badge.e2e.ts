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
