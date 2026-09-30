import { render } from '@stencil/vitest';
import { themeLabelVariantDictionary } from '@type/variant';
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
  describe('the label color variants', () => {
    /** The value that drives the paint; a variant with no block of its own never reaches it. */
    const painted = async (variant: string): Promise<string> => {
      const { root } = await render(
        `<mds-push-notification-item variant="${variant}" icon="mi/baseline/palette"></mds-push-notification-item>`,
      );
      return getComputedStyle(root)
        .getPropertyValue('--mds-push-notification-item-icon-background-color')
        .trim();
    };

    it('paints every variant of the dictionary, none of them falling back', async () => {
      // red and purple were in the dictionary and in the tokens, but had no block here:
      // they painted the default, silently
      const fallback = await painted('there-is-no-such-variant');

      for (const variant of themeLabelVariantDictionary) {
        expect([variant, await painted(variant)]).not.toEqual([variant, fallback]);
      }
    });
  });
});
