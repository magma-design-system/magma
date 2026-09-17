import { render } from '@stencil/vitest';
import { createSlottedChild } from '@test/slot';

/**
 * The awaiting spinner slides in over --duration-300 and the button's own width follows it,
 * so a box read right after the attribute lands catches the animation halfway. Sit the
 * transition out, then poll until the box stops moving.
 */
const settledBox = async (element: Element): Promise<DOMRect> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  let previous = '';
  let box = element.getBoundingClientRect();
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    box = element.getBoundingClientRect();
    const current = `${box.width}x${box.height}`;
    if (current === previous) return box;
    previous = current;
  }

  return box;
};

describe('mds-button', () => {
  it('renders', async () => {
    const { root } = await render('<mds-button></mds-button>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('falls back to the md typography for an unknown size', async () => {
    const { root } = await render('<mds-button size="">Label</mds-button>');

    const text = root.shadowRoot!.querySelector('mds-text');
    expect(text).toEqualAttribute('typography', 'action');
  });

  describe('the awaiting state', () => {
    it('keeps the box of a button that has no label', async () => {
      // the button with no label is a square, so letting the spinner in beside the icon
      // grew it in BOTH axes - 36 to 56 - and pushed the line it sits in
      const { root, waitForChanges } = await render(
        '<mds-button icon="mi/baseline/keyboard" title="Test"></mds-button>',
      );
      const before = await settledBox(root);

      (root as HTMLMdsButtonElement).await = true;
      await waitForChanges();
      const after = await settledBox(root);

      expect(after.width).toBe(before.width);
      expect(after.height).toBe(before.height);
    });

    it('puts the spinner where the icon was, on a button that has no label', async () => {
      const { root, waitForChanges } = await render(
        '<mds-button icon="mi/baseline/keyboard" title="Test"></mds-button>',
      );

      (root as HTMLMdsButtonElement).await = true;
      await waitForChanges();
      await settledBox(root);

      const icon = root.shadowRoot!.querySelector('.icon')!;
      expect(getComputedStyle(icon).display).toBe('none');
    });

    it('keeps the spinner inside the button at every size', async () => {
      // the small size scaled the spinner by scale(75) - 7500%, not 75% - which painted
      // it 1800px wide, off the button and over the page
      const { root, waitForChanges } = await render(
        '<mds-button size="sm" icon="mi/baseline/keyboard" title="Test"></mds-button>',
      );

      (root as HTMLMdsButtonElement).await = true;
      await waitForChanges();
      const button = await settledBox(root);
      const spinner = await settledBox(root.shadowRoot!.querySelector('.await')!);

      expect(spinner.width).toBeGreaterThan(0);
      expect(spinner.width).toBeLessThanOrEqual(button.width);
      expect(spinner.height).toBeLessThanOrEqual(button.height);
    });

    it('still makes room for the spinner when there is a label', async () => {
      // the room is the point of the animation: only the square case had to stop growing
      const { root, waitForChanges } = await render('<mds-button label="Salva"></mds-button>');
      const before = await settledBox(root);

      (root as HTMLMdsButtonElement).await = true;
      await waitForChanges();
      const after = await settledBox(root);

      expect(after.width).toBeGreaterThan(before.width);
      expect(after.height).toBe(before.height);
    });
  });

  describe('notification slot', () => {
    it('renders the notification slotted after the first render', async () => {
      const { root, waitForChanges } = await render('<mds-button label="Label"></mds-button>');

      root.appendChild(createSlottedChild('notification', 'span'));
      await waitForChanges();

      const slot = root.shadowRoot!.querySelector('slot[name="notification"]') as HTMLSlotElement;
      expect(slot).not.toBeNull();
      expect(slot.assignedElements()).toHaveLength(1);
    });
  });
});
