import { render, vi } from '@stencil/vitest';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toastsOf = (region: HTMLElement): HTMLMdsToastElement[] =>
  Array.from(region.querySelectorAll<HTMLMdsToastElement>('mds-toast'));

/** The toast as the person sees it: the host is a strip, the dialog is the toast. */
const box = (toast: HTMLElement): DOMRect =>
  toast.shadowRoot!.querySelector<HTMLElement>('.dialog')!.getBoundingClientRect();

/** The entrance is half a second long: read the boxes once they have stopped moving. */
const settled = () => wait(700);

describe('mds-toast-region', () => {
  it('renders', async () => {
    const { root } = await render('<mds-toast-region></mds-toast-region>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #951: two toasts shown at the same time were drawn at the same place, one over the other
  describe('lining up the toasts', () => {
    it('lines up the visible toasts at its edge, the newest at the edge', async () => {
      const { root } = await render(`
        <mds-toast-region>
          <mds-toast visible duration="0">Saved</mds-toast>
          <mds-toast visible duration="0">Copied</mds-toast>
        </mds-toast-region>
      `);
      await settled();
      const [older, newer] = toastsOf(root).map(box);

      expect(older.bottom).toBeLessThanOrEqual(newer.top);
      // the gap from the edge of a toast on its own
      expect(Math.round(window.innerHeight - newer.bottom)).toBe(16);
    });

    it('puts the newest toast at the top edge in a region at the top', async () => {
      const { root } = await render(`
        <mds-toast-region position="top-center">
          <mds-toast visible duration="0">Saved</mds-toast>
          <mds-toast visible duration="0">Copied</mds-toast>
        </mds-toast-region>
      `);
      await settled();
      const [older, newer] = toastsOf(root).map(box);

      expect(newer.bottom).toBeLessThanOrEqual(older.top);
      expect(Math.round(newer.top)).toBe(16);
    });

    it('closes the gap of a toast that leaves, once its exit is over', async () => {
      const { root } = await render(`
        <mds-toast-region style="--mds-toast-duration: 50ms">
          <mds-toast visible duration="0">Saved</mds-toast>
          <mds-toast visible duration="0">Copied</mds-toast>
        </mds-toast-region>
      `);
      await settled();
      const [older, newer] = toastsOf(root);

      newer.visible = false;
      await settled();

      expect(getComputedStyle(newer).display).toBe('none');
      expect(Math.round(window.innerHeight - box(older).bottom)).toBe(16);
    });

    it('gives its position to the toasts, the ones added later too, and when it changes', async () => {
      const { root, waitForChanges } = await render<HTMLMdsToastRegionElement>(`
        <mds-toast-region position="top-right">
          <mds-toast duration="0">Saved</mds-toast>
        </mds-toast-region>
      `);
      const [first] = toastsOf(root);
      await vi.waitFor(() => expect(first.position).toBe('top-right'));

      const added = document.createElement('mds-toast');
      added.textContent = 'Copied';
      root.appendChild(added);
      await vi.waitFor(() => expect(added.position).toBe('top-right'));

      root.position = 'bottom-left';
      await waitForChanges();
      expect(first.position).toBe('bottom-left');
      expect(added.position).toBe('bottom-left');
    });
  });

  describe('for assistive technologies', () => {
    it('is a live region in the page before any message, not atomic', async () => {
      const { root } = await render('<mds-toast-region></mds-toast-region>');

      expect(root).toEqualAttributes({
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': 'false',
      });
    });

    it('takes the status role from its toasts, and gives it back to one moved out', async () => {
      const { root } = await render(`
        <mds-toast-region>
          <mds-toast visible duration="0">Saved</mds-toast>
        </mds-toast-region>
      `);
      const [toast] = toastsOf(root);
      await vi.waitFor(() => expect(toast).toHaveAttribute('stacked'));
      expect(toast).not.toHaveAttribute('role');

      document.body.appendChild(toast);
      await vi.waitFor(() => expect(toast).toEqualAttribute('role', 'status'));
      expect(toast).not.toHaveAttribute('stacked');
      toast.remove();
    });
  });

  // #951: a cap on the toasts shown at once, the oldest one with a timer leaving first
  describe('the most toasts visible at once', () => {
    it('hides the oldest toast with a timer when one more shows', async () => {
      const { root, spyOnEvent } = await render(`
        <mds-toast-region max="2" style="--mds-toast-duration: 0s">
          <mds-toast visible duration="60000">Saved</mds-toast>
          <mds-toast visible duration="60000">Copied</mds-toast>
          <mds-toast duration="60000">Deleted</mds-toast>
        </mds-toast-region>
      `);
      const close = spyOnEvent('mdsToastClose');
      const [oldest, middle, newest] = toastsOf(root);
      await settled();

      newest.visible = true;

      await vi.waitFor(() => expect(oldest.visible).toBe(false));
      expect(middle.visible).toBe(true);
      expect(newest.visible).toBe(true);
      await vi.waitFor(() => expect(close).toHaveReceivedEventDetail({ reason: 'hide' }));
    });

    it('follows the order the toasts were shown in, not the order of the page', async () => {
      const { root } = await render(`
        <mds-toast-region max="2">
          <mds-toast duration="60000">Saved</mds-toast>
          <mds-toast duration="60000">Copied</mds-toast>
          <mds-toast duration="60000">Deleted</mds-toast>
        </mds-toast-region>
      `);
      const [first, second, third] = toastsOf(root);
      await settled();

      third.visible = true;
      await wait(100);
      first.visible = true;
      await wait(100);
      second.visible = true;

      await vi.waitFor(() => expect(third.visible).toBe(false));
      expect(first.visible).toBe(true);
      expect(second.visible).toBe(true);
    });

    it('never hides a toast that stays, nor the one just shown', async () => {
      const { root } = await render(`
        <mds-toast-region max="1">
          <mds-toast visible duration="0">Not sent</mds-toast>
          <mds-toast duration="60000">Saved</mds-toast>
          <mds-toast duration="60000">Copied</mds-toast>
        </mds-toast-region>
      `);
      const [stays, timed, next] = toastsOf(root);
      await settled();

      timed.visible = true;
      await wait(300);
      expect(stays.visible).toBe(true);
      expect(timed.visible).toBe(true);

      // now the timed one is old: the next one takes its place, the persistent one stays
      next.visible = true;
      await vi.waitFor(() => expect(timed.visible).toBe(false));
      expect(stays.visible).toBe(true);
      expect(next.visible).toBe(true);
    });

    it('ignores an invalid max with a warning, and keeps three', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { root } = await render(`
        <mds-toast-region max="0">
          <mds-toast visible duration="60000">One</mds-toast>
          <mds-toast visible duration="60000">Two</mds-toast>
          <mds-toast visible duration="60000">Three</mds-toast>
        </mds-toast-region>
      `);
      await settled();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('mds-toast-region'));
      expect(toastsOf(root).every((toast) => toast.visible)).toBe(true);
      warn.mockRestore();
    });
  });
});
