import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-push-notification', () => {
  it('renders', async () => {
    const { root } = await render('<mds-push-notification></mds-push-notification>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders the clear button and the notifications slot', async () => {
    const { root } = await render('<mds-push-notification></mds-push-notification>');

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('mds-button')).toEqualAttributes({
      label: 'Cancella notifiche',
      variant: 'dark',
    });
    expect(shadow.querySelector('.notifications[part="notifications"] > slot')).not.toBeNull();
  });

  it('hides and emits mdsPushNotificationHide when the clear button is clicked', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      '<mds-push-notification visible></mds-push-notification>',
    );
    const hideSpy = spyOnEvent('mdsPushNotificationHide');

    await userEvent.click(root.shadowRoot!.querySelector('mds-button')!);
    await waitForChanges();

    expect(hideSpy).toHaveReceivedEventTimes(1);
    expect(root).not.toHaveAttribute('visible');
  });
});
