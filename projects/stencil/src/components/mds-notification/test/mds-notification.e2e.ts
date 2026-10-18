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

  // the host had a CSS selector in aria-labelledby and an aria-label on no role: nothing reached
  // a screen reader through the element the badge sits on (#821)
  describe('the count', () => {
    const stage = (attributes: string, callerAttributes = '') =>
      render(
        `<div><button id="inbox" ${callerAttributes}>Inbox</button><mds-notification target="#inbox" ${attributes}></mds-notification></div>`,
      );

    it('describes the element it sits on, and leaves the page reading of the badge out', async () => {
      const { root } = await stage('value="3"');
      const badge = root.querySelector('mds-notification')!;
      const inbox = root.querySelector('#inbox')!;

      await vi.waitFor(() => expect(inbox).toHaveAttribute('aria-describedby'));

      expect(inbox.getAttribute('aria-describedby')).toBe(badge.id);
      expect(badge).toEqualAttribute('aria-hidden', 'true');
      expect(badge).not.toHaveAttribute('aria-label');
      expect(badge).not.toHaveAttribute('aria-labelledby');
      expect(dotText(badge)).toBe('3');
    });

    it('keeps the descriptions the element already had', async () => {
      const { root } = await stage('value="3"', 'aria-describedby="hint"');
      const badge = root.querySelector('mds-notification')!;
      const inbox = root.querySelector('#inbox')!;

      await vi.waitFor(() =>
        expect(inbox.getAttribute('aria-describedby')).toBe(`hint ${badge.id}`),
      );
    });

    it('describes nothing while dismissed or a plain dot, and again once it counts', async () => {
      const { root, waitForChanges } = await stage('value="3"');
      const badge = root.querySelector('mds-notification')!;
      const inbox = root.querySelector('#inbox')!;
      await vi.waitFor(() => expect(inbox).toHaveAttribute('aria-describedby'));

      badge.dismissed = true;
      await waitForChanges();
      expect(inbox).not.toHaveAttribute('aria-describedby');

      badge.dismissed = false;
      badge.value = 0;
      await waitForChanges();
      expect(inbox).not.toHaveAttribute('aria-describedby');
      expect(badge).not.toHaveAttribute('aria-hidden');

      badge.value = 7;
      await waitForChanges();
      expect(inbox.getAttribute('aria-describedby')).toBe(badge.id);
    });

    it('takes its description back when it leaves the page', async () => {
      const { root } = await stage('value="3"');
      const inbox = root.querySelector('#inbox')!;
      await vi.waitFor(() => expect(inbox).toHaveAttribute('aria-describedby'));

      root.querySelector('mds-notification')!.remove();

      expect(inbox).not.toHaveAttribute('aria-describedby');
    });

    it('is plain text without a target, read with what contains it', async () => {
      const { root, waitForChanges } = await render(
        '<mds-notification value="5" strategy="disabled"></mds-notification>',
      );
      await waitForChanges();

      expect(root).not.toHaveAttribute('aria-hidden');
      expect(root.shadowRoot!.querySelector('.dot')).not.toHaveAttribute('aria-hidden');
    });
  });
});
