import { render, vi } from '@stencil/vitest';

const dotText = (root: HTMLElement): string =>
  root.shadowRoot!.querySelector('.dot')!.textContent ?? '';

describe('mds-notification', () => {
  it('renders', async () => {
    const { root } = await render(`<mds-notification target="#my-button"></mds-notification>
    <mds-button id="my-button">Incoming messages</mds-button>`);

    expect(root).toHaveAttribute('hydrated');
  });

  it('does not warn without a target, as in the notification slot of mds-button', async () => {
    const consoleWarn = vi.spyOn(console, 'warn');
    const { root, waitForChanges } = await render(
      '<mds-button>Inbox<mds-notification slot="notification" value="5"></mds-notification></mds-button>',
    );
    await waitForChanges();

    expect(root.querySelector('mds-notification')).toHaveAttribute('strategy', 'disabled');
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it('shows the value again once the max attribute is removed', async () => {
    const { root, waitForChanges } = await render(
      '<mds-notification value="15" max="9" strategy="disabled"></mds-notification>',
    );
    expect(dotText(root)).toBe('+9');

    root.removeAttribute('max');
    await waitForChanges();

    expect(dotText(root)).toBe('15');
  });

  it('shows nothing once the value attribute is removed', async () => {
    const { root, waitForChanges } = await render(
      '<mds-notification value="5" strategy="disabled"></mds-notification>',
    );

    root.removeAttribute('value');
    await waitForChanges();

    expect(dotText(root)).toBe('');
  });
});
