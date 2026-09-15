import { render } from '@stencil/vitest';
import { createSlottedChild, describeConditionalSlot } from '@test/slot';
import { userEvent } from 'vitest/browser';

describe('mds-modal', () => {
  it('renders', async () => {
    const { root } = await render('<mds-modal></mds-modal>');

    expect(root).toHaveAttribute('hydrated');
    expect(root).toHaveAttribute('position');
    expect(root.getAttribute('position')).toBe('center');
    expect(root).not.toHaveAttribute('opened');
  });

  it('renders opened', async () => {
    const { root } = await render('<mds-modal opened="true"></mds-modal>');

    expect(root).toHaveAttribute('opened');
  });

  it('can be closed', async () => {
    const { root, waitForChanges } = await render('<mds-modal opened="true"></mds-modal>');

    expect(root.getAttribute('opened')).not.toBe('false');

    // The native <dialog> fills the viewport and centers the window, so a click
    // on a corner lands on the backdrop area (target === dialog), which dismisses
    // the modal under the default `relaxed` interaction.
    const dialog = root.shadowRoot!.querySelector('dialog')!;
    await userEvent.click(dialog, { position: { x: 5, y: 5 } });
    await waitForChanges();

    expect(root).not.toHaveAttribute('opened');
  });

  describeConditionalSlot({
    html: '<mds-modal>Text</mds-modal>',
    slot: 'top',
    region: '.window-header',
    childTag: 'div',
  });

  describeConditionalSlot({
    html: '<mds-modal>Text</mds-modal>',
    slot: 'bottom',
    region: '.window-footer',
    childTag: 'div',
  });

  describe('window slot', () => {
    it('replaces the window with the content slotted after the first render', async () => {
      const { root, waitForChanges } = await render('<mds-modal>Text</mds-modal>');
      const shadow = root.shadowRoot!;

      expect(shadow.querySelector('.window')).not.toBeNull();
      expect(shadow.querySelector('.action-close')).not.toBeNull();

      const window = createSlottedChild('window', 'div');
      root.appendChild(window);
      await waitForChanges();

      expect(shadow.querySelector('.window')).toBeNull();
      expect(shadow.querySelector('.action-close')).toBeNull();
      expect(window).toHaveAttribute('role', 'dialog');
      const slot = shadow.querySelector('slot[name="window"]') as HTMLSlotElement;
      expect(slot.assignedElements()).toHaveLength(1);
    });

    it('restores the window when the slotted content is removed', async () => {
      const { root, waitForChanges } = await render(
        '<mds-modal><div slot="window">Window</div></mds-modal>',
      );
      const shadow = root.shadowRoot!;

      expect(shadow.querySelector('.window')).toBeNull();

      root.querySelector('[slot="window"]')!.remove();
      await waitForChanges();

      expect(shadow.querySelector('.window')).not.toBeNull();
      expect(shadow.querySelector('.action-close')).not.toBeNull();
    });
  });
});
