import { render } from '@stencil/vitest';

describe('mds-pref-mode', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-mode></mds-pref-mode>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('writes the mode under the mode names, never the theme ones', async () => {
    localStorage.removeItem('mdsPrefTheme');
    await render('<mds-pref-mode mode="dark"></mds-pref-mode>');

    const html = document.documentElement;
    expect(html.style.getPropertyValue('--magma-pref-mode')).toBe('dark');
    expect(html).toHaveClass('pref-mode-dark');
    expect(localStorage.getItem('mdsPrefMode')).toBe('dark');
    // before #702 these three names were the mode's; now they are the theme's
    expect(html.style.getPropertyValue('--magma-pref-theme')).toBe('');
    expect([...html.classList].filter((name) => name.startsWith('pref-theme-'))).toEqual([]);
    expect(localStorage.getItem('mdsPrefTheme')).toBeNull();
    html.style.removeProperty('--magma-pref-mode');
  });

  it('locks only the dark item when locked-scheme is light', async () => {
    const { root } = await render(
      '<mds-pref-mode mode="light" locked-scheme="light"></mds-pref-mode>',
    );

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.item--dark')).toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--light')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
  });

  it('locks only the light item when locked-scheme is dark', async () => {
    const { root } = await render(
      '<mds-pref-mode mode="dark" locked-scheme="dark"></mds-pref-mode>',
    );

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.item--light')).toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--dark')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
  });

  it('locks nothing when locked-scheme is absent', async () => {
    const { root } = await render('<mds-pref-mode mode="light"></mds-pref-mode>');

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.item--light')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--system')).not.toHaveAttribute('disabled');
    expect(shadow.querySelector('.item--dark')).not.toHaveAttribute('disabled');
  });

  it('keeps the stored mode preference: a locked dark item stays selected and clicking it is a no-op', async () => {
    const { root, waitForChanges } = await render<HTMLMdsPrefModeElement>(
      '<mds-pref-mode mode="dark" locked-scheme="light"></mds-pref-mode>',
    );
    const dark = root.shadowRoot!.querySelector<HTMLElement>('.item--dark')!;

    // the stored preference (dark) is preserved and reflected as selected, but locked
    expect(root.mode).toBe('dark');
    expect(dark).toHaveAttribute('selected');
    expect(dark).toHaveAttribute('disabled');
    expect(localStorage.getItem('mdsPrefMode')).toBe('dark');

    // clicking the locked item must not change the mode nor the stored preference
    dark.click();
    await waitForChanges();

    expect(root.mode).toBe('dark');
    expect(localStorage.getItem('mdsPrefMode')).toBe('dark');
  });
});
