import { render, vi } from '@stencil/vitest';
import { useLanguage } from '@test/language';
import { createSlottedChild, describeConditionalSlot } from '@test/slot';
import { page, userEvent } from 'vitest/browser';

// a press on the backdrop counts only once the window has finished its entry (#1266): the cases
// that dismiss from the backdrop take this promise before opening, and wait for it
const entered = (root: HTMLMdsModalElement): Promise<void> =>
  new Promise((resolve) => {
    root.addEventListener('mdsModalShow', () => resolve(), { once: true });
  });

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
    const { root, waitForChanges } = await render<HTMLMdsModalElement>('<mds-modal></mds-modal>');

    const shown = entered(root);
    root.opened = true;
    await waitForChanges();
    await shown;

    expect(root).toHaveAttribute('opened');

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
      const stage = await render<HTMLMdsModalElement>('<mds-modal>Text</mds-modal>');
      const shown = entered(stage.root);
      const root = await openOn(stage);
      await shown;

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

    // #1189 widths/dialog: the window of a dialog is the column of a form plus its inset
    it('stops the window at the width of a dialog, the column of a form plus its inset', async () => {
      const { root } = await render(
        '<mds-modal opened><div slot="window">Window</div></mds-modal><div style="width: calc(56ch + 48px)"></div>',
      );
      const window = root.querySelector('[slot="window"]')!.getBoundingClientRect();

      expect(window.width).toBe(root.nextElementSibling!.getBoundingClientRect().width);
      expect(window.left + window.width / 2).toBe(640);
    });

    it('leaves a bespoke window the width its class gives it', async () => {
      const { root } = await render(
        '<mds-modal opened><div slot="window" class="bespoke">Window</div></mds-modal><style>.bespoke { max-width: 60rem; }</style>',
      );

      expect(root.querySelector('[slot="window"]')!.getBoundingClientRect().width).toBe(960);
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

  // #1266: the browser sends a click to the nearest common ancestor of the press and the release,
  // so a press in a field released on the backdrop (selecting its text by dragging) was a click
  // on the <dialog>, and closed the modal
  describe('a press and a release on two sides of the window', () => {
    const open = async (markup: string) => {
      const stage = await render<HTMLMdsModalElement>(markup);
      const shown = entered(stage.root);
      stage.root.opened = true;
      await stage.waitForChanges();
      await shown;
      return {
        ...stage,
        dialog: stage.root.shadowRoot!.querySelector('dialog')!,
        field: stage.root.querySelector('input')!,
      };
    };

    it('leaves the modal open when the press in a field is released on the backdrop', async () => {
      const { root, waitForChanges, dialog, field } = await open(
        '<mds-modal position="right"><input value="Some text to select"></mds-modal>',
      );

      // the corner of the dialog, far from the window on the right: the backdrop
      await userEvent.dragAndDrop(field, dialog, { targetPosition: { x: 5, y: 5 } });
      await waitForChanges();

      expect(root).toHaveAttribute('opened');
    });

    it('leaves the modal open when the press on the backdrop is released in a field', async () => {
      const { root, waitForChanges, dialog, field } = await open(
        '<mds-modal position="right"><input value="Some text to select"></mds-modal>',
      );

      await userEvent.dragAndDrop(dialog, field, { sourcePosition: { x: 5, y: 5 } });
      await waitForChanges();

      expect(root).toHaveAttribute('opened');
    });

    it('closes the modal when the press and the release are both on the backdrop', async () => {
      const { root, waitForChanges, dialog } = await open(
        '<mds-modal position="right"><input value="Some text to select"></mds-modal>',
      );

      await userEvent.dragAndDrop(dialog, dialog, {
        sourcePosition: { x: 5, y: 5 },
        targetPosition: { x: 5, y: 40 },
      });
      await waitForChanges();

      expect(root).not.toHaveAttribute('opened');
    });
  });

  // #1266: while the window slides in, the place where it is going to stop is still backdrop, so
  // a click aimed at a field of the window closed the modal
  it('ignores a press on the backdrop while the window is still coming in', async () => {
    // a slow entry, so that the click lands well before the window has stopped
    const { root, waitForChanges } = await render<HTMLMdsModalElement>(
      '<mds-modal position="right" style="--mds-modal-transition-duration: 5s"></mds-modal>',
    );

    root.opened = true;
    await waitForChanges();
    const dialog = root.shadowRoot!.querySelector('dialog')!;
    await userEvent.click(dialog, { position: { x: 5, y: 5 } });
    await waitForChanges();

    expect(root).toHaveAttribute('opened');
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

// a content taller than any screen of the tests
const tall = Array.from({ length: 80 }, (_, line) => `<p>Riga ${line + 1}</p>`).join('');

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

  // #1189 widths/dialog: the window shrinks with the screen, its margin around it
  it('gives a slotted window the screen less its margin', async () => {
    await page.viewport(360, 640);
    const { root } = await render('<mds-modal opened><div slot="window">Window</div></mds-modal>');

    expect(root.querySelector('[slot="window"]')!.getBoundingClientRect().width).toBe(360 - 48);
  });

  it('keeps the strip at the side of a side position', async () => {
    await page.viewport(360, 640);
    const { root } = await render('<mds-modal opened position="left"><p>Contenuto</p></mds-modal>');
    const window = root.shadowRoot!.querySelector<HTMLElement>('.window')!;

    expect(window.offsetLeft).toBe(0);
    expect(window.offsetTop).toBe(0);
    expect(window.offsetWidth).toBeLessThan(360);
  });

  // #1160: top and bottom are as tall as their content, and a tall one covered the whole screen,
  // with the close button hidden
  it('keeps a strip of backdrop above a tall bottom window, with a close button that works', async () => {
    await page.viewport(360, 640);
    const { root, waitForChanges } = await render(
      `<mds-modal opened position="bottom" interaction="strict"><div>${tall}</div></mds-modal>`,
    );
    const close = root.shadowRoot!.querySelector<HTMLElement>('.action-close')!;
    const window = root.shadowRoot!.querySelector<HTMLElement>('.window')!;
    await vi.waitFor(() => expect(getComputedStyle(close).opacity).toBe('1'));

    expect(window.offsetTop).toBeGreaterThanOrEqual(close.offsetTop + close.offsetHeight);
    expect(window.offsetTop + window.offsetHeight).toBe(640);
    // the content scrolls inside the window, which does not scroll with it
    expect(window.scrollHeight).toBe(window.clientHeight);

    await userEvent.click(close);
    await waitForChanges();
    expect(root).not.toHaveAttribute('opened');
  });

  it('keeps a strip of backdrop below a tall top window, with a close button that works', async () => {
    await page.viewport(360, 640);
    const { root, waitForChanges } = await render(
      `<mds-modal opened position="top" interaction="strict"><div>${tall}</div></mds-modal>`,
    );
    const close = root.shadowRoot!.querySelector<HTMLElement>('.action-close')!;
    const window = root.shadowRoot!.querySelector<HTMLElement>('.window')!;
    await vi.waitFor(() => expect(getComputedStyle(close).opacity).toBe('1'));

    expect(window.offsetTop).toBe(0);
    expect(window.offsetTop + window.offsetHeight).toBeLessThanOrEqual(close.offsetTop);
    expect(close.offsetTop + close.offsetHeight).toBeLessThanOrEqual(640);
    expect(window.scrollHeight).toBe(window.clientHeight);

    await userEvent.click(close);
    await waitForChanges();
    expect(root).not.toHaveAttribute('opened');
  });
});

// #1160: on a wide screen the close button showed only for left and right, while a strict modal
// has nothing else to close it by; center, top and bottom left 40px on each side, too few for it
describe('mds-modal on a wide screen', () => {
  it.each(['center', 'top', 'bottom', 'top-left', 'bottom-left'])(
    'leaves a strip of backdrop at the right of %s, with a close button that works',
    async (position) => {
      const { root, waitForChanges } = await render(
        `<mds-modal opened position="${position}" interaction="strict"><div>${tall}</div></mds-modal>`,
      );
      const close = root.shadowRoot!.querySelector<HTMLElement>('.action-close')!;
      const window = root.shadowRoot!.querySelector<HTMLElement>('.window')!;
      await vi.waitFor(() => expect(getComputedStyle(close).opacity).toBe('1'));

      expect(close.offsetLeft).toBeGreaterThanOrEqual(window.offsetLeft + window.offsetWidth);
      expect(close.offsetLeft + close.offsetWidth).toBeLessThanOrEqual(1280);

      await userEvent.click(close);
      await waitForChanges();
      expect(root).not.toHaveAttribute('opened');
    },
  );

  it.each(['top-right', 'bottom-right'])(
    'leaves a strip of backdrop at the left of %s, with a close button that works',
    async (position) => {
      const { root, waitForChanges } = await render(
        `<mds-modal opened position="${position}" interaction="strict"><div>${tall}</div></mds-modal>`,
      );
      const close = root.shadowRoot!.querySelector<HTMLElement>('.action-close')!;
      const window = root.shadowRoot!.querySelector<HTMLElement>('.window')!;
      await vi.waitFor(() => expect(getComputedStyle(close).opacity).toBe('1'));

      expect(close.offsetLeft).toBeGreaterThanOrEqual(0);
      expect(close.offsetLeft + close.offsetWidth).toBeLessThanOrEqual(window.offsetLeft);

      await userEvent.click(close);
      await waitForChanges();
      expect(root).not.toHaveAttribute('opened');
    },
  );
});

// #1143: the distance was a bare 0, which calc() cannot take from 100dvh: without globals.css,
// which registers it as a length, the window lost its max height and a tall content ran off the
// screen, out of reach
it('keeps a tall modal inside the screen, without the global stylesheet', async () => {
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
