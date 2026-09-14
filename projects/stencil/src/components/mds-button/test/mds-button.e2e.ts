import { render } from '@stencil/vitest';
import { createSlottedChild } from '@test/slot';

describe('mds-button', () => {
  it('renders', async () => {
    const { root } = await render('<mds-button></mds-button>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('falls back to the md typography for an unknown size', async () => {
    const { root } = await render('<mds-button size="">Label</mds-button>');

    const text = root.shadowRoot!.querySelector('mds-text');
    expect(text).toEqualAttribute('typography', 'action');
  });

  describe('notification slot', () => {
    it('renders the notification slotted after the first render', async () => {
      const { root, waitForChanges } = await render('<mds-button label="Label"></mds-button>');

      root.appendChild(createSlottedChild('notification', 'span'));
      await waitForChanges();

      const slot = root.shadowRoot!.querySelector('slot[name="notification"]') as HTMLSlotElement;
      expect(slot).not.toBeNull();
      expect(slot.assignedElements()).toHaveLength(1);
    });
  });
});
