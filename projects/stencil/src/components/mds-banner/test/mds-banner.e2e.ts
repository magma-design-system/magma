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

  // #1192, titles of #1189: the headline is the title of a part in the page, and the title of the
  // dialog as its window, above the h6 of the parts and the groups of fields the dialog holds
  describe('the style of the headline', () => {
    const queryBanner = (root: HTMLElement): HTMLMdsBannerElement =>
      (root.localName === 'mds-banner'
        ? root
        : root.querySelector('mds-banner')) as HTMLMdsBannerElement;
    const styleOf = (root: HTMLElement): string | null =>
      queryBanner(root).shadowRoot!.querySelector('.headline')!.getAttribute('typography');
    const fontSizeOf = (root: HTMLElement): string =>
      getComputedStyle(queryBanner(root).shadowRoot!.querySelector('.headline')!).fontSize;
    // the size the style of a level gives an mds-text in the same page
    const fontSizeOfLevel = async (level: 'h5' | 'h6'): Promise<string> => {
      const { root } = await render(`<mds-text typography="${level}">Titolo</mds-text>`);
      return getComputedStyle(root).fontSize;
    };

    const inPage = (attributes = '') =>
      render(`<mds-banner headline="Bozza" ${attributes}>Text</mds-banner>`);
    const inWindow = (attributes = '') =>
      render(
        `<mds-modal aria-label="Nuovo contatto"><mds-banner slot="window" headline="Nuovo contatto" ${attributes}>Text</mds-banner></mds-modal>`,
      );

    it('is the title of a part in the page, the style h6', async () => {
      const { root } = await inPage();

      expect(styleOf(root)).toBe('part');
      expect(fontSizeOf(root)).toBe(await fontSizeOfLevel('h6'));
    });

    it('is the title of a dialog as the window of mds-modal, the style h5', async () => {
      const { root } = await inWindow();

      expect(styleOf(root)).toBe('dialog');
      expect(fontSizeOf(root)).toBe(await fontSizeOfLevel('h5'));
      expect(fontSizeOf(root)).not.toBe(await fontSizeOfLevel('h6'));
    });

    it('takes the written style in the page', async () => {
      const { root } = await inPage('typography="h5"');

      expect(styleOf(root)).toBe('h5');
    });

    it('takes the written style as the window of a dialog', async () => {
      const { root } = await inWindow('typography="h6"');

      expect(styleOf(root)).toBe('h6');
    });

    it('falls back to the style of its place on a value it does not know', async () => {
      const page = await inPage('typography="h4"');
      const dialog = await inWindow('typography="h4"');

      expect(styleOf(page.root)).toBe('part');
      expect(styleOf(dialog.root)).toBe('dialog');
    });

    it('goes back to the style of its place when the written one is removed', async () => {
      const { root, waitForChanges } = await inWindow('typography="h6"');

      queryBanner(root).removeAttribute('typography');
      await waitForChanges();

      expect(styleOf(root)).toBe('dialog');
    });

    // a slot window anywhere else is no window: mds-modal takes its window from its children
    it('is the title of a part in the slot window of anything but mds-modal', async () => {
      const { root } = await render(
        '<div><mds-banner slot="window" headline="Bozza">Text</mds-banner></div>',
      );

      expect(styleOf(root)).toBe('part');
    });

    // a banner moved in the page is connected again without loading again (SPEC, Lifecycle)
    it('follows the banner moved into a modal and out of it after the load', async () => {
      const { root, waitForChanges } = await render(
        '<div><mds-banner slot="window" headline="Nuovo contatto">Text</mds-banner><mds-modal aria-label="Nuovo contatto"></mds-modal></div>',
      );
      const banner = queryBanner(root);
      expect(styleOf(root)).toBe('part');

      root.querySelector('mds-modal')!.appendChild(banner);
      await waitForChanges();
      expect(styleOf(root)).toBe('dialog');

      root.appendChild(banner);
      await waitForChanges();
      expect(styleOf(root)).toBe('part');
    });

    it('follows a change of its slot inside mds-modal after the load', async () => {
      const { root } = await render(
        '<mds-modal aria-label="Nuovo contatto"><mds-banner headline="Nuovo contatto">Text</mds-banner></mds-modal>',
      );
      const banner = queryBanner(root);
      expect(styleOf(root)).toBe('part');

      // the attribute is seen by an observer, which re-renders after its own microtask
      banner.setAttribute('slot', 'window');
      await vi.waitFor(() => expect(styleOf(root)).toBe('dialog'));

      banner.removeAttribute('slot');
      await vi.waitFor(() => expect(styleOf(root)).toBe('part'));
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
