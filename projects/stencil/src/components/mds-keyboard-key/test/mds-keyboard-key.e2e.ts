import { render, vi } from '@stencil/vitest';

describe('mds-keyboard-key', () => {
  it('renders', async () => {
    const { root } = await render('<mds-keyboard-key></mds-keyboard-key>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders an empty name without a title', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { root } = await render('<mds-keyboard-key name=""></mds-keyboard-key>');

    expect(root).not.toHaveAttribute('title');
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('drops the title once the name attribute is removed', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { root, waitForChanges } = await render(
      '<mds-keyboard-key name="control"></mds-keyboard-key>',
    );
    expect(root).toHaveAttribute('title');

    root.removeAttribute('name');
    await waitForChanges();

    expect(root).not.toHaveAttribute('title');
    expect(consoleError).not.toHaveBeenCalled();
  });

  // #824: the rule selected [code='space'], an attribute the key does not have
  it('draws the space key twice as wide as the others', async () => {
    const minWidth = (root: HTMLElement): number =>
      parseFloat(getComputedStyle(root.shadowRoot!.querySelector('.physical-key')!).minWidth);
    const { root: control } = await render('<mds-keyboard-key name="control"></mds-keyboard-key>');
    const key = minWidth(control);
    const { root: space } = await render('<mds-keyboard-key name="space"></mds-keyboard-key>');

    expect(key).toBeGreaterThan(0);
    expect(minWidth(space)).toBe(key * 2);
  });
});
