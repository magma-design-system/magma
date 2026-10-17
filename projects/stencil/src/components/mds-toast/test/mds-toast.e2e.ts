import { render } from '@stencil/vitest';
import { describeConditionalSlot } from '@test/slot';

describe('mds-toast', () => {
  it('renders', async () => {
    const { root } = await render('<mds-toast>Text</mds-toast>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('does not close right away once the duration attribute is removed', async () => {
    const { root, waitForChanges } = await render<HTMLMdsToastElement>(
      '<mds-toast visible duration="60000">Text</mds-toast>',
    );

    root.removeAttribute('duration');
    await waitForChanges();
    // a timer started with a null duration fires on the next task
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(root.visible).toBe(true);
  });

  // the countdown was an interval nobody stopped: a dismissed toast emitted mdsToastClose again
  // every duration (#823)
  describe('the countdown', () => {
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    it('hides the toast once and emits mdsToastClose once', async () => {
      const { root, spyOnEvent } = await render<HTMLMdsToastElement>(
        '<mds-toast visible duration="100">Text</mds-toast>',
      );
      const close = spyOnEvent('mdsToastClose');

      // the duration, then the wait for the exit animation (1s when it is not read)
      await wait(1600);

      expect(root.visible).toBe(false);
      expect(close).toHaveReceivedEventTimes(1);
    });

    it('stops when the toast is hidden by code, which then emits nothing', async () => {
      const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsToastElement>(
        '<mds-toast visible duration="300">Text</mds-toast>',
      );
      const close = spyOnEvent('mdsToastClose');

      root.visible = false;
      await waitForChanges();
      await wait(600);

      expect(close).not.toHaveReceivedEvent();
    });

    it('stops when the toast leaves the page', async () => {
      const { root, spyOnEvent } = await render<HTMLMdsToastElement>(
        '<mds-toast visible duration="100">Text</mds-toast>',
      );
      const close = spyOnEvent('mdsToastClose');

      root.remove();
      await wait(500);

      expect(close).not.toHaveReceivedEvent();
    });
  });

  describe('where it sits', () => {
    /** The animated box: the host is a full-width fixed strip, the dialog is the toast. */
    const dialog = (root: HTMLElement): HTMLElement =>
      root.shadowRoot!.querySelector<HTMLElement>('.dialog')!;

    /** The transitions are half a second long; read the box once it has stopped moving. */
    const settled = async (element: HTMLElement): Promise<DOMRect> => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      return element.getBoundingClientRect();
    };

    it('parks a toast that is not visible outside the screen', async () => {
      // the travel was spelled --spacing(full), which compiles to nothing: the declaration
      // was dropped and the toast sat painted against the edge, cut by it
      const { root } = await render('<mds-toast position="bottom-center">Text</mds-toast>');

      const box = await settled(dialog(root));

      expect(box.top).toBeGreaterThanOrEqual(window.innerHeight);
    });

    it('parks a top toast above the screen, shadow included', async () => {
      const { root } = await render('<mds-toast position="top-center">Text</mds-toast>');

      const box = await settled(dialog(root));

      expect(box.bottom).toBeLessThanOrEqual(0);
    });

    it('leaves the same gap from the edge it comes in on', async () => {
      const { root, waitForChanges } = await render(
        '<mds-toast position="bottom-center">Text</mds-toast>',
      );

      (root as HTMLMdsToastElement).visible = true;
      await waitForChanges();
      const box = await settled(dialog(root));

      expect(Math.round(window.innerHeight - box.bottom)).toBe(16);
    });
  });

  describeConditionalSlot({
    html: '<mds-toast>Text</mds-toast>',
    slot: 'action',
    region: '.actions',
  });
});
