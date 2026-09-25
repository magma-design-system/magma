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

  it('pads the content of a modal that mounts already open', async () => {
    const { root } = await render(
      '<mds-modal opened="true">' +
        '<div slot="top" style="height: 40px">Top</div>' +
        'Text' +
        '<div slot="bottom" style="height: 24px">Bottom</div>' +
        '</mds-modal>',
    );

    // the bars are absolute over the scroll area, so the padding is the only thing
    // keeping the first and the last line out from under them
    const content = root.shadowRoot!.querySelector('.window-content') as HTMLElement;

    expect(content.style.paddingTop).toBe('40px');
    expect(content.style.paddingBottom).toBe('24px');
  });

  it('lets the page colour through the dialog', async () => {
    const { root } = await render('<mds-modal opened="true"><p>Text</p></mds-modal>');

    root.style.color = 'rgb(200, 30, 30)';

    // the UA sheet gives a dialog `color: CanvasText`, and inheritance follows the
    // flattened tree, so without the reset every slotted element takes the pure
    // black or white of the colour scheme instead of the page colour
    const dialog = root.shadowRoot!.querySelector('dialog')!;
    expect(getComputedStyle(dialog).color).toBe('rgb(200, 30, 30)');
    expect(getComputedStyle(root.querySelector('p')!).color).toBe('rgb(200, 30, 30)');
  });

  describe('body scroll lock', () => {
    // Mounting a new stage disconnects the modals of the previous cases, and
    // disconnectedCallback releases the body: whatever a case wants on the body
    // has to be written AFTER its render, or that release wipes it.
    const openOn = async (
      { root, waitForChanges },
      overflow?: string,
    ): Promise<HTMLMdsModalElement> => {
      if (overflow === undefined) {
        document.body.style.removeProperty('overflow');
      } else {
        document.body.style.overflow = overflow;
      }
      root.opened = true;
      await waitForChanges();
      return root;
    };

    afterEach(() => {
      document.body.style.removeProperty('overflow');
    });

    it('releases the body when the modal is dismissed', async () => {
      const stage = await render('<mds-modal>Text</mds-modal>');
      const root = await openOn(stage);

      expect(document.body.style.overflow).toBe('hidden');

      // same backdrop dismissal as the case above
      const dialog = root.shadowRoot!.querySelector('dialog')!;
      await userEvent.click(dialog, { position: { x: 5, y: 5 } });
      await stage.waitForChanges();

      // the page scrolls again: the lock is gone, not replaced by another value
      expect(document.body.style.overflow).toBe('');
    });

    it('releases the body when the consumer closes it from the prop', async () => {
      const stage = await render('<mds-modal>Text</mds-modal>');
      const root = await openOn(stage);

      root.opened = false;
      await stage.waitForChanges();

      expect(document.body.style.overflow).toBe('');
    });

    it('puts back an overflow the page had set on its own', async () => {
      const stage = await render('<mds-modal>Text</mds-modal>');
      const root = await openOn(stage, 'clip');

      expect(document.body.style.overflow).toBe('hidden');

      root.opened = false;
      await stage.waitForChanges();

      expect(document.body.style.overflow).toBe('clip');
    });

    it('leaves the body alone when the lock is manual', async () => {
      const stage = await render('<mds-modal overflow="manual">Text</mds-modal>');
      const root = await openOn(stage);

      expect(document.body.style.overflow).toBe('');

      root.opened = false;
      await stage.waitForChanges();

      expect(document.body.style.overflow).toBe('');
    });
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
      expect(window).not.toHaveAttribute('role');
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

  describe('accessible name', () => {
    it('names the native dialog after the aria-label of the host', async () => {
      const { root } = await render('<mds-modal aria-label="Conferma"></mds-modal>');

      expect(root.shadowRoot!.querySelector('dialog')).toEqualAttribute('aria-label', 'Conferma');
    });

    it('leaves the slotted window out of the dialog role, the native one being the dialog', async () => {
      const { root } = await render(
        '<mds-modal aria-label="Conferma"><div slot="window">Content</div></mds-modal>',
      );

      expect(root.querySelector('[slot="window"]')).not.toHaveAttribute('role');
    });
  });
});
