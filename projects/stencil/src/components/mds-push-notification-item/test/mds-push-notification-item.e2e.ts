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

// the button dismisses the notification, it deletes nothing: `dismissible` is its name, and
// `deletable` stays as a deprecated one, reflected and mutable as before
describe('mds-push-notification-item dismiss button', () => {
  const closeButton = (root: HTMLElement): Element | null =>
    root.shadowRoot!.querySelector('.close-button');

  /** The end padding grows to make room for the button. */
  const makesRoom = (root: HTMLElement): boolean => {
    const style = getComputedStyle(root);
    return parseFloat(style.paddingRight) > parseFloat(style.paddingLeft);
  };

  it('has no dismiss button unless it is dismissible', async () => {
    const { root } = await render(
      '<mds-push-notification-item message="Ciao"></mds-push-notification-item>',
    );

    expect(closeButton(root)).toBeNull();
    expect(makesRoom(root)).toBe(false);
  });

  it.each(['dismissible', 'deletable'])(
    'shows the dismiss button and makes room for it with %s',
    async (name) => {
      const { root } = await render(
        `<mds-push-notification-item ${name} message="Ciao"></mds-push-notification-item>`,
      );

      expect(closeButton(root)).not.toBeNull();
      expect(makesRoom(root)).toBe(true);
    },
  );

  it.each(['dismissible', 'deletable'] as const)(
    'reflects %s set as a property, so the room for the button follows it',
    async (name) => {
      const { root, waitForChanges } = await render<HTMLMdsPushNotificationItemElement>(
        '<mds-push-notification-item message="Ciao"></mds-push-notification-item>',
      );

      root[name] = true;
      await waitForChanges();

      expect(root).toHaveAttribute(name);
      expect(closeButton(root)).not.toBeNull();
      expect(makesRoom(root)).toBe(true);

      root[name] = false;
      await waitForChanges();

      expect(root).not.toHaveAttribute(name);
      expect(closeButton(root)).toBeNull();
      expect(makesRoom(root)).toBe(false);
    },
  );

  it.each(['dismissible', 'deletable'])(
    'drops %s="false" from the host once loaded',
    async (name) => {
      const { root, waitForChanges } = await render(
        `<mds-push-notification-item ${name}="false" message="Ciao"></mds-push-notification-item>`,
      );
      await waitForChanges();

      expect(root).not.toHaveAttribute(name);
      expect(closeButton(root)).toBeNull();
      expect(makesRoom(root)).toBe(false);
    },
  );
});

// the close event declares { id } and was emitted with no detail at all (#823)
describe('mds-push-notification-item close', () => {
  it('names the item it closes', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      '<mds-push-notification-item id="message-7" dismissible message="Ciao"></mds-push-notification-item>',
    );
    const close = spyOnEvent('mdsPushNotificationItemClose');

    root.shadowRoot!.querySelector<HTMLElement>('.close-button')!.click();
    await waitForChanges();

    expect(close.lastEvent?.detail).toEqual({ id: 'message-7' });
  });
});
