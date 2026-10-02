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
});
