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

  // actions/stacked (#1189): under 380px of its content the row of actions stacks, every action
  // at the full width in the order of the row; above it the row stays on one line
  describe('the row of actions', () => {
    const banner = (width: string) =>
      render(
        `<mds-banner headline="Bozza" style="box-sizing: border-box; width: ${width}"><mds-button slot="action" variant="dark" tone="outline">Ignora</mds-button><mds-button slot="action">Usa la descrizione</mds-button></mds-banner>`,
      );
    const boxes = (root: HTMLElement) =>
      Array.from(root.querySelectorAll('mds-button')).map((action) =>
        action.getBoundingClientRect(),
      );

    // 26rem less the inset of 600 on both sides: 368px of content
    it('stacks under 380px of its content, each action at the full width', async () => {
      const { root } = await banner('26rem');
      const [first, second] = boxes(root);

      expect(second.top).toBeGreaterThan(first.bottom);
      expect(first.width).toBeCloseTo(second.width, 0);
    });

    // 27rem: 384px of content
    it('keeps the row on one line from 380px of its content', async () => {
      const { root } = await banner('27rem');
      const [first, second] = boxes(root);

      expect(second.top).toBeCloseTo(first.top, 0);
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

    // #1145: the button dismisses the message, it deletes nothing; magma 3 drops the old name (#1334)
    it('shows no close button for deletable, the old name of dismissible', async () => {
      const { root } = await render('<mds-banner deletable>Text</mds-banner>');

      expect(closeButton(root)).toBeNull();
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
