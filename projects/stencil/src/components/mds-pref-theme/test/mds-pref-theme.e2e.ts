import { render } from '@stencil/vitest';

describe('mds-pref-theme', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-theme></mds-pref-theme>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('locks only the dark item when locked-scheme is light', async () => {
    const { root } = await render(
      '<mds-pref-theme mode="light" locked-scheme="light"></mds-pref-theme>',
    );

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.item--dark')).toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--light')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
  });

  it('locks only the light item when locked-scheme is dark', async () => {
    const { root } = await render(
      '<mds-pref-theme mode="dark" locked-scheme="dark"></mds-pref-theme>',
    );

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.item--light')).toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--dark')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
  });

  it('locks nothing when locked-scheme is absent', async () => {
    const { root } = await render('<mds-pref-theme mode="light"></mds-pref-theme>');

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.item--light')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--dark')).not.toHaveAttribute('disabled');
  });

  it('keeps the stored mode preference: a locked dark item stays selected and clicking it is a no-op', async () => {
    const { root, waitForChanges } = await render<HTMLMdsPrefThemeElement>(
      '<mds-pref-theme mode="dark" locked-scheme="light"></mds-pref-theme>',
    );
    const dark = root.shadowRoot!.querySelector<HTMLElement>('.item--dark')!;

    // the stored preference (dark) is preserved and reflected as selected, but locked
    expect(root.mode).toBe('dark');
    expect(dark).toHaveAttribute('selected');
    expect(dark).toHaveAttribute('disabled');
    expect(localStorage.getItem('mdsPrefTheme')).toBe('dark');

    // clicking the locked item must not change the mode nor the stored preference
    dark.click();
    await waitForChanges();

    expect(root.mode).toBe('dark');
    expect(localStorage.getItem('mdsPrefTheme')).toBe('dark');
  });
});
