import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { describeConditionalSlot } from '@test/slot';
import { useLanguage } from '@test/language';

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
      expect(close).toHaveReceivedEventDetail({ reason: 'timeout' });
    });

    it('stops when the toast is hidden by code, which then closes once as hidden', async () => {
      const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsToastElement>(
        '<mds-toast visible duration="300" style="--mds-toast-duration: 0s">Text</mds-toast>',
      );
      const close = spyOnEvent('mdsToastClose');

      root.visible = false;
      await waitForChanges();
      await wait(600);

      expect(close).toHaveReceivedEventTimes(1);
      expect(close).toHaveReceivedEventDetail({ reason: 'hide' });
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

  // #824: the close waited 1000 ms whatever the transition: the duration was read from
  // --mds-tab-duration, a property nothing sets on a toast
  it('emits mdsToastClose once the exit transition is over', async () => {
    const { root, spyOnEvent } = await render<HTMLMdsToastElement>(
      '<mds-toast visible duration="100" style="--mds-toast-duration: 50ms">Text</mds-toast>',
    );
    const close = spyOnEvent('mdsToastClose');

    await vi.waitFor(() => expect(root.visible).toBeFalsy(), { timeout: 1000 });
    const hidden = performance.now();
    await vi.waitFor(() => expect(close).toHaveReceivedEvent(), { timeout: 1500 });

    expect(performance.now() - hidden).toBeLessThan(500);
  });

  // #952: the person could not hide the toast, the countdown ran while the person was using its
  // action, and only the countdown emitted mdsToastClose
  describe('closing', () => {
    useLanguage('it');
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const hideButton = (root: HTMLElement): HTMLMdsButtonElement | null =>
      root.shadowRoot!.querySelector<HTMLMdsButtonElement>('mds-button.hide');

    it('has no hide button unless it is deletable', async () => {
      const { root } = await render('<mds-toast visible duration="0">Text</mds-toast>');

      expect(hideButton(root)).toBeNull();
    });

    it('has a hide button with a name, out of any form', async () => {
      const { root } = await render('<mds-toast visible deletable duration="0">Text</mds-toast>');

      expect(hideButton(root)).toEqualAttribute('aria-label', 'Nascondi');
      expect(hideButton(root)).toEqualAttribute('type', 'button');
    });

    // an arrow, not a cross, next to an action that may itself be a cancel: it points to the
    // edge the toast leaves by
    it('draws the hide button as an arrow towards the edge of the toast', async () => {
      const { root, waitForChanges } = await render<HTMLMdsToastElement>(
        '<mds-toast visible deletable duration="0" position="bottom-left">Text</mds-toast>',
      );
      // the paths of mi/baseline/arrow-downward and arrow-upward
      expect(hideButton(root)!.getAttribute('icon')).toContain('M20 12l-1.41-1.41L13 16.17');

      root.position = 'top-right';
      await waitForChanges();

      expect(hideButton(root)!.getAttribute('icon')).toContain('M4 12l1.41 1.41L11 7.83');
    });

    it('hides on the hide button and emits mdsToastClose once as closed', async () => {
      const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsToastElement>(
        '<mds-toast visible deletable duration="0" style="--mds-toast-duration: 0s">Text</mds-toast>',
      );
      const close = spyOnEvent('mdsToastClose');

      await userEvent.click(hideButton(root)!);
      await waitForChanges();

      expect(root.visible).toBe(false);
      await vi.waitFor(() => expect(close).toHaveReceivedEvent());
      await wait(200);
      expect(close).toHaveReceivedEventTimes(1);
      expect(close).toHaveReceivedEventDetail({ reason: 'close' });
    });

    it('emits nothing for a toast that was never shown', async () => {
      const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsToastElement>(
        '<mds-toast style="--mds-toast-duration: 0s">Text</mds-toast>',
      );
      const close = spyOnEvent('mdsToastClose');

      root.visible = false;
      await waitForChanges();
      await wait(200);

      expect(close).not.toHaveReceivedEvent();
    });

    it('drops the close of a toast shown again before its exit is over', async () => {
      const { root, spyOnEvent, waitForChanges } = await render<HTMLMdsToastElement>(
        '<mds-toast visible duration="0" style="--mds-toast-duration: 300ms">Text</mds-toast>',
      );
      const close = spyOnEvent('mdsToastClose');

      root.visible = false;
      await waitForChanges();
      root.visible = true;
      await waitForChanges();
      await wait(600);

      expect(close).not.toHaveReceivedEvent();
    });
  });

  describe('the countdown, while the person is using the toast', () => {
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const html = `
      <mds-toast visible duration="300" style="--mds-toast-duration: 0s">
        Text
        <mds-button slot="action" size="sm">Retry</mds-button>
      </mds-toast>
      <button id="away">Away</button>`;

    // a real pointer: the hover of the browser driver can take some hundred milliseconds on a
    // busy machine, so the duration leaves it room to land before the time is up
    it('waits while the pointer is over the toast, and goes on once it leaves', async () => {
      const { waitForChanges } = await render<HTMLMdsToastElement>(
        html.replace('duration="300"', 'duration="1500"'),
      );
      const toast = document.querySelector<HTMLMdsToastElement>('mds-toast')!;
      const action = toast.querySelector<HTMLElement>('[slot="action"]')!;

      await userEvent.hover(action);
      await wait(1800);
      expect(toast.visible).toBe(true);

      await userEvent.hover(document.querySelector<HTMLElement>('#away')!);
      await waitForChanges();
      await vi.waitFor(() => expect(toast.visible).toBe(false), { timeout: 2500 });
    });

    it('waits while the focus is inside the toast, and goes on once it leaves', async () => {
      const { waitForChanges } = await render<HTMLMdsToastElement>(html);
      const toast = document.querySelector<HTMLMdsToastElement>('mds-toast')!;
      const action = toast.querySelector<HTMLElement>('[slot="action"]')!;

      action.focus();
      await wait(600);
      expect(toast.visible).toBe(true);

      document.querySelector<HTMLElement>('#away')!.focus();
      await waitForChanges();
      await vi.waitFor(() => expect(toast.visible).toBe(false), { timeout: 1000 });
    });

    // the boundary events sent straight to the toast, so the time they arrive is the one measured
    it('counts only the rest of the time once the pointer leaves', async () => {
      await render<HTMLMdsToastElement>(html.replace('duration="300"', 'duration="2000"'));
      const toast = document.querySelector<HTMLMdsToastElement>('mds-toast')!;
      const dialog = toast.shadowRoot!.querySelector<HTMLElement>('.dialog')!;

      await wait(1500);
      dialog.dispatchEvent(new PointerEvent('pointerenter'));
      await wait(600);
      // past the 2000 ms of the duration, held
      expect(toast.visible).toBe(true);
      dialog.dispatchEvent(new PointerEvent('pointerleave'));
      const left = performance.now();
      await vi.waitFor(() => expect(toast.visible).toBe(false), { timeout: 2500 });

      // about 500 ms were left; counting the whole duration again would take 2000
      expect(performance.now() - left).toBeLessThan(1300);
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

  // no live region, so a screen reader never announced the toast; and the hidden toast was only
  // moved out of the viewport, its message still read in the page (#821)
  describe('for assistive technologies', () => {
    const dialog = (root: HTMLElement): HTMLElement =>
      root.shadowRoot!.querySelector<HTMLElement>('.dialog')!;

    it('is a status region', async () => {
      const { root } = await render('<mds-toast>Saved</mds-toast>');

      expect(root).toEqualAttribute('role', 'status');
    });

    it('keeps the message hidden until it shows, and hides it again at the end of the exit', async () => {
      const { root, waitForChanges } = await render<HTMLMdsToastElement>(
        '<mds-toast duration="0" style="--mds-toast-duration: 0s">Saved</mds-toast>',
      );
      expect(getComputedStyle(dialog(root)).visibility).toBe('hidden');

      root.visible = true;
      await waitForChanges();
      expect(getComputedStyle(dialog(root)).visibility).toBe('visible');

      root.visible = false;
      await waitForChanges();
      await vi.waitFor(() => expect(getComputedStyle(dialog(root)).visibility).toBe('hidden'));
    });
  });
});
