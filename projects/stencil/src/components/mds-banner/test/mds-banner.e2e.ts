import { render } from '@stencil/vitest';

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
});
