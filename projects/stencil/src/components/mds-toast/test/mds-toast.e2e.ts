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
