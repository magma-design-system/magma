import { render, vi } from '@stencil/vitest';
import { useLanguage } from '@test/language';
import { createSlottedChild, describeConditionalSlot } from '@test/slot';
import { page, userEvent } from 'vitest/browser';

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

  // a horizontal swipe closed the modal whatever the interaction: strict vetoed Esc and the
  // backdrop, not the swipe (#820)
  describe('a horizontal swipe', () => {
    const swipe = (target: HTMLElement, fromX: number, toX: number): void => {
      const touch = (x: number) => new Touch({ identifier: 1, target, clientX: x, clientY: 100 });
      target.dispatchEvent(new TouchEvent('touchstart', { touches: [touch(fromX)] }));
      target.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch(toX)] }));
    };

    it('closes a relaxed modal', async () => {
      const { root, waitForChanges } = await render('<mds-modal opened="true"></mds-modal>');

      swipe(root.shadowRoot!.querySelector<HTMLElement>('.window')!, 300, 100);
      await waitForChanges();

      expect(root).not.toHaveAttribute('opened');
    });

    it('leaves a strict modal open', async () => {
      const { root, waitForChanges } = await render(
        '<mds-modal opened="true" interaction="strict"></mds-modal>',
      );

      swipe(root.shadowRoot!.querySelector<HTMLElement>('.window')!, 300, 100);
      await waitForChanges();

      expect(root).toHaveAttribute('opened');
    });
  });

  // #803: a position set in the same task as opened, the way a framework wrapper sets its props,
  // was still the old attribute when the dialog opened, and the window slid in from the place
  // of that old position (the centre: translateY(25%)), already inside the page
  describe('the entry', () => {
    /** What `read` sees on the first frame the dialog is open. */
    const onFirstFrame = <T>(
      root: HTMLMdsModalElement,
      read: (dialog: HTMLDialogElement, window: HTMLElement) => T,
    ): Promise<T> =>
      new Promise((resolve) => {
        const tick = (): void => {
          const dialog = root.shadowRoot!.querySelector('dialog')!;
          if (!dialog.open) {
            requestAnimationFrame(tick);
            return;
          }
          resolve(read(dialog, root.shadowRoot!.querySelector<HTMLElement>('.window')!));
        };
        requestAnimationFrame(tick);
      });

    /** The transform of the window on the first frame the dialog is open. */
    const firstFrame = (root: HTMLMdsModalElement): Promise<DOMMatrix> =>
      onFirstFrame(root, (_dialog, window) => new DOMMatrix(getComputedStyle(window).transform));

    it.each([
      ['right', 1],
      ['left', -1],
    ])(
      'starts outside the page on the %s, with the position set together with opened',
      async (position, side) => {
        const { root } = await render<HTMLMdsModalElement>('<mds-modal><p>content</p></mds-modal>');

        root.position = position as HTMLMdsModalElement['position'];
        root.opened = true;
        const start = await firstFrame(root);

        // slid sideways out of the page, not up from below inside it
        expect(Math.sign(start.m41)).toBe(side);
        expect(start.m42).toBe(0);
      },
    );

    // #1019: showModal() moves the focus to the first focusable element of the window, and the
    // browser scrolled the dialog to bring it into view. The window, still at translate(100%),
    // widened the scrollable area of the dialog by its own width, so the dialog scrolled by that
    // much and the window started already in its place: the transform was right, the scroll hid it
    it('starts outside the page with a focusable element in the content', async () => {
      const { root } = await render<HTMLMdsModalElement>(
        '<mds-modal position="right"><button>Action</button></mds-modal>',
      );

      root.opened = true;
      const start = await onFirstFrame(root, (dialog, window) => ({
        left: window.getBoundingClientRect().left,
        scrollLeft: dialog.scrollLeft,
      }));

      expect(start.scrollLeft).toBe(0);
      expect(start.left).toBeGreaterThanOrEqual(innerWidth - 1);
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

// #1143: on a phone a centred modal filled the screen with its close button hidden: nothing
// was left to tap but its own content
describe('mds-modal on a narrow screen', () => {
  afterEach(async () => {
    // the size of the browser project in vitest.config.mts
    await page.viewport(1280, 800);
  });

  it.each(['center', 'top-right'])(
    'leaves a strip of backdrop at the top, with a close button that works (%s)',
    async (position) => {
      await page.viewport(360, 640);
      const { root, waitForChanges } = await render(
        `<mds-modal opened position="${position}" interaction="strict"><p>Contenuto</p></mds-modal>`,
      );
      const close = root.shadowRoot!.querySelector<HTMLElement>('.action-close')!;
      const window = root.shadowRoot!.querySelector<HTMLElement>('.window')!;
      await vi.waitFor(() => expect(getComputedStyle(close).opacity).toBe('1'));

      // the boxes of the layout, in the dialog: the entry still moves them with a transform
      expect(window.offsetTop).toBeGreaterThanOrEqual(close.offsetTop + close.offsetHeight);
      expect(window.offsetTop + window.offsetHeight).toBe(640);

      await userEvent.click(close);
      await waitForChanges();
      expect(root).not.toHaveAttribute('opened');
    },
  );

  it('keeps the strip at the side of a side position', async () => {
    await page.viewport(360, 640);
    const { root } = await render('<mds-modal opened position="left"><p>Contenuto</p></mds-modal>');
    const window = root.shadowRoot!.querySelector<HTMLElement>('.window')!;

    expect(window.offsetLeft).toBe(0);
    expect(window.offsetTop).toBe(0);
    expect(window.offsetWidth).toBeLessThan(360);
  });
});

// #1143: the distance was a bare 0, which calc() cannot take from 100dvh: without globals.css,
// which registers it as a length, the window lost its max height and a tall content ran off the
// screen, out of reach
it('keeps a tall modal inside the screen, without the global stylesheet', async () => {
  const tall = Array.from({ length: 80 }, (_, line) => `<p>Riga ${line + 1}</p>`).join('');
  const { root } = await render(`<mds-modal opened><div>${tall}</div></mds-modal>`);
  const window = root.shadowRoot!.querySelector('.window')!;

  expect(window.getBoundingClientRect().height).toBeLessThanOrEqual(800);
  expect(window.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
});

// #937: the close button is an icon-only button
describe('mds-modal close button', () => {
  useLanguage('it');

  it('is a button named in the current language', async () => {
    const { root } = await render('<mds-modal><p>Contenuto</p></mds-modal>');

    expect(root.shadowRoot!.querySelector('.action-close')).toEqualAttributes({
      role: 'button',
      'aria-label': 'Chiudi',
    });
  });

  // #824: the documented name was misspelled (-funciton) and the close button read the right one
  describe('transition timing function', () => {
    const timingOf = (root: HTMLElement, selector: string): string =>
      getComputedStyle(root.shadowRoot!.querySelector(selector)!).transitionTimingFunction;

    it('drives the window and the close button', async () => {
      const { root } = await render(
        '<mds-modal style="--mds-modal-transition-timing-function: steps(3)"></mds-modal>',
      );

      expect(timingOf(root, '.window')).toBe('steps(3)');
      expect(timingOf(root, '.action-close')).toBe('steps(3)');
    });

    it('still reads the misspelled name', async () => {
      const { root } = await render(
        '<mds-modal style="--mds-modal-transition-timing-funciton: steps(4)"></mds-modal>',
      );

      expect(timingOf(root, '.window')).toBe('steps(4)');
      expect(timingOf(root, '.action-close')).toBe('steps(4)');
    });
  });
});
