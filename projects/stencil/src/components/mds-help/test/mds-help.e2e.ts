import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';

describe('mds-help', () => {
  it('renders without icon', async () => {
    const { root } = await render('<mds-help icon=""></mds-help>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders with icon', async () => {
    mockIconFetch();
    const { root } = await render('<mds-help></mds-help>');

    expect(root).toHaveAttribute('hydrated');
  });
  // the icon was not focusable and the tooltip opened on mouseenter only: keyboard users never
  // read the help (#820)
  it('opens the help from the keyboard, and names the icon with it', async () => {
    mockIconFetch();
    const { root, waitForChanges } = await render(
      '<mds-help>Il codice sta sulla tessera</mds-help>',
    );
    const icon = root.shadowRoot!.querySelector<HTMLElement>('.icon')!;
    const tooltip = root.shadowRoot!.querySelector('mds-tooltip')!;

    expect(icon).toEqualAttributes({ role: 'img', tabindex: '0' });
    await vi.waitFor(() => expect(icon).toEqualAttribute('aria-labelledby', tooltip.id));

    await userEvent.keyboard('{Tab}');
    await waitForChanges();

    expect(root.shadowRoot!.activeElement).toBe(icon);
    expect(tooltip.visible).toBe(true);
  });
});
