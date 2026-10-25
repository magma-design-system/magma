import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

const queryActions = (root: HTMLElement): HTMLElement =>
  root.shadowRoot!.querySelector('.actions') as HTMLElement;

const queryActionSlot = (root: HTMLElement): HTMLSlotElement =>
  root.shadowRoot!.querySelector('slot[name="action"]') as HTMLSlotElement;

const createAction = (label: string): HTMLElement => {
  const action = document.createElement('mds-button');
  action.setAttribute('slot', 'action');
  action.textContent = label;
  return action;
};

describe('mds-banner', () => {
  it('renders', async () => {
    const { root } = await render('<mds-banner></mds-banner>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('action slot', () => {
    it('hides the action region when nothing is slotted', async () => {
      const { root } = await render('<mds-banner>Text</mds-banner>');

      expect(getComputedStyle(queryActions(root)).display).toBe('none');
    });

    it('shows the action region when an action is slotted on the first render', async () => {
      const { root } = await render(
        '<mds-banner>Text<mds-button slot="action">Action</mds-button></mds-banner>',
      );

      expect(getComputedStyle(queryActions(root)).display).toBe('flex');
      expect(queryActionSlot(root).assignedElements()).toHaveLength(1);
    });

    it('shows the action region when an action is slotted after the first render', async () => {
      const { root, waitForChanges } = await render('<mds-banner>Text</mds-banner>');

      root.appendChild(createAction('Action'));
      await waitForChanges();

      expect(getComputedStyle(queryActions(root)).display).toBe('flex');
      expect(queryActionSlot(root).assignedElements()).toHaveLength(1);
    });

    it('keeps the action region visible while at least one action is slotted', async () => {
      const { root, waitForChanges } = await render('<mds-banner>Text</mds-banner>');

      root.appendChild(createAction('Cancel'));
      root.appendChild(createAction('Confirm'));
      await waitForChanges();

      expect(queryActionSlot(root).assignedElements()).toHaveLength(2);

      root.querySelector('[slot="action"]')!.remove();
      await waitForChanges();

      expect(getComputedStyle(queryActions(root)).display).toBe('flex');
      expect(queryActionSlot(root).assignedElements()).toHaveLength(1);
    });

    it('hides the action region again when the last action is removed', async () => {
      const { root, waitForChanges } = await render(
        '<mds-banner>Text<mds-button slot="action">Action</mds-button></mds-banner>',
      );

      root.querySelector('[slot="action"]')!.remove();
      await waitForChanges();

      expect(getComputedStyle(queryActions(root)).display).toBe('none');
    });
  });

  describe('close button', () => {
    const closeButton = (root: HTMLElement): HTMLElement | null =>
      root.shadowRoot!.querySelector('.close-button');

    it('has no close button unless it is dismissible', async () => {
      const { root } = await render('<mds-banner>Text</mds-banner>');

      expect(closeButton(root)).toBeNull();
    });

    it('dismisses with the close button of a dismissible banner', async () => {
      const { root, spyOnEvent } = await render('<mds-banner dismissible>Text</mds-banner>');
      const close = spyOnEvent('mdsBannerClose');

      await userEvent.click(closeButton(root)!);

      await vi.waitFor(() => expect(close).toHaveReceivedEventTimes(1));
    });

    // #1145: the button dismisses the message, it deletes nothing; the old name still works
    it('keeps deletable as a deprecated name of dismissible', async () => {
      const { root } = await render('<mds-banner deletable>Text</mds-banner>');

      expect(closeButton(root)).not.toBeNull();
    });

    // the close button sits at the top right of a narrow banner; a framework sets the prop as a
    // property, with no attribute to select
    it('keeps the headline clear of the close button in a narrow banner', async () => {
      const { root, waitForChanges } = await render<HTMLMdsBannerElement>(
        '<mds-banner headline="Titolo" style="width: 280px">Text</mds-banner>',
      );
      root.dismissible = true;
      await waitForChanges();

      const headline = root.shadowRoot!.querySelector('.headline')!;
      expect(getComputedStyle(headline).paddingRight).toBe('32px');
    });
  });
});
