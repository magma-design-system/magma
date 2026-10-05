import { render } from '@stencil/vitest';

describe('mds-pref-theme-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-theme-item></mds-pref-theme-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('builds the label from the name once the label attribute is removed', async () => {
    const { root, waitForChanges } = await render<HTMLMdsPrefThemeItemElement>(
      '<mds-pref-theme-item name="dark-blue" label="Custom"></mds-pref-theme-item>',
    );

    root.removeAttribute('label');
    await waitForChanges();

    expect(root.label).toBe('Dark blue');
  });
});
