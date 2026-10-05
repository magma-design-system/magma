import { render, vi } from '@stencil/vitest';

describe('mds-pref-language-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-pref-language-item></mds-pref-language-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders the language name for a known code', async () => {
    const { root } = await render('<mds-pref-language-item code="it"></mds-pref-language-item>');

    expect(root).toHaveAttribute('hydrated');

    // v2 passes the language name through the reflected label prop instead of slotted text
    const button = root.shadowRoot!.querySelector('mds-button');
    expect(button).not.toBeNull();
    expect(button).toEqualAttribute('label', 'Italiano');
  });

  it('does not throw and still hydrates when no code is set', async () => {
    const { root } = await render('<mds-pref-language-item></mds-pref-language-item>');

    expect(root).toHaveAttribute('hydrated');

    // render() must reach its fallback instead of the lifecycle throwing.
    expect(root.shadowRoot!.querySelector('mds-button')).toEqualAttribute('variant', 'error');
  });

  it('falls back to the no-code button once the code attribute is removed', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { root, waitForChanges } = await render(
      '<mds-pref-language-item code="it"></mds-pref-language-item>',
    );

    root.removeAttribute('code');
    await waitForChanges();

    expect(root.shadowRoot!.querySelector('mds-button')).toEqualAttribute('variant', 'error');
    expect(consoleError).not.toHaveBeenCalled();
  });
});
