import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { useLanguage } from '@test/language';

describe('mds-push-notification', () => {
  it('renders', async () => {
    const { root } = await render('<mds-push-notification></mds-push-notification>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('renders the clear button and the notifications slot', async () => {
    const { root } = await render('<mds-push-notification></mds-push-notification>');

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('mds-button')).toEqualAttributes({
      label: 'Clear notifications',
      variant: 'dark',
    });
    expect(shadow.querySelector('.notifications[part="notifications"] > slot')).not.toBeNull();
  });

  it('hides once the last item of indented markup is removed', async () => {
    const { root, waitForChanges } = await render<HTMLMdsPushNotificationElement>(`
      <mds-push-notification>
        <mds-push-notification-item>Nuovo messaggio</mds-push-notification-item>
      </mds-push-notification>
    `);
    await vi.waitFor(() => expect(root).toHaveAttribute('visible'));

    await root.removeNotification(root.querySelector('mds-push-notification-item')!);
    await waitForChanges();

    expect(root).not.toHaveAttribute('visible');
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

describe('mds-push-notification in Italian', () => {
  useLanguage('it');

  it('labels the clear button in the page language', async () => {
    const { root } = await render('<mds-push-notification></mds-push-notification>');

    expect(root.shadowRoot!.querySelector('mds-button')).toEqualAttribute(
      'label',
      'Cancella notifiche',
    );
  });
});
