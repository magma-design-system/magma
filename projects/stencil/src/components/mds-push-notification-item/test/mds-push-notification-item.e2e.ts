import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-push-notification-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-push-notification-item></mds-push-notification-item>');

    expect(root).toHaveAttribute('hydrated');
    expect(root).toEqualAttributes({
      'date-format': 'timeago',
      message: 'Nessun messaggio disponibile',
      preview: 'image',
      tone: 'weak',
    });

    const shadow = root.shadowRoot!;
    expect(shadow.querySelector('.content[part="content"] > .header > .infos')).not.toBeNull();

    const message = shadow.querySelector('.content > mds-text.message')!;
    expect(message).toEqualAttributes({
      tag: 'span',
      truncate: 'all',
      typography: 'caption',
      variant: 'info',
    });
    expect(message.textContent?.trim()).toBe('Nessun messaggio disponibile');
  });

  describeConditionalSlot({
    html: '<mds-push-notification-item message="Message"></mds-push-notification-item>',
    slot: 'badge',
    region: '.badge',
    childTag: 'span',
  });

  describeConditionalSlot({
    html: '<mds-push-notification-item message="Message"></mds-push-notification-item>',
    slot: 'action',
    region: '.actions',
  });
});
