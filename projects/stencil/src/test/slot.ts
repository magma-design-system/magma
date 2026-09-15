import { render } from '@stencil/vitest';

interface ConditionalSlotOptions {
  /** Markup of the host, without children assigned to the slot under test */
  html: string;
  /** Name of the slot under test */
  slot: string;
  /** Selector, inside the shadow root, of the region hidden while the slot is empty */
  region: string;
  /** Tag of the element the tests assign to the slot */
  childTag?: string;
}

/**
 * Creates an element assigned to the given slot, ready to be appended to a host.
 */
const createSlottedChild = (slot: string, tag = 'mds-button'): HTMLElement => {
  const child = document.createElement(tag);
  child.setAttribute('slot', slot);
  child.textContent = 'Content';
  return child;
};

const queryDisplay = (root: HTMLElement, region: string): string =>
  getComputedStyle(root.shadowRoot!.querySelector(region) as HTMLElement).display;

const queryAssigned = (root: HTMLElement, slot: string): Element[] =>
  (root.shadowRoot!.querySelector(`slot[name="${slot}"]`) as HTMLSlotElement).assignedElements();

/**
 * Shared cases for a region a component shows only while its named slot has
 * children: hidden without content, shown from the first render, shown when the
 * content arrives after the first render, hidden again once it is removed.
 */
const describeConditionalSlot = ({
  html,
  slot,
  region,
  childTag = 'mds-button',
}: ConditionalSlotOptions): void => {
  describe(`${slot} slot`, () => {
    it('hides the region when nothing is slotted', async () => {
      const { root } = await render(html);

      expect(queryDisplay(root, region)).toBe('none');
      expect(queryAssigned(root, slot)).toHaveLength(0);
    });

    it('shows the region when a child is slotted on the first render', async () => {
      const child = `<${childTag} slot="${slot}">Content</${childTag}>`;
      const { root } = await render(html.trim().replace(/<\/[^>]+>$/, `${child}$&`));

      expect(queryDisplay(root, region)).not.toBe('none');
      expect(queryAssigned(root, slot)).toHaveLength(1);
    });

    it('shows the region when a child is slotted after the first render', async () => {
      const { root, waitForChanges } = await render(html);

      root.appendChild(createSlottedChild(slot, childTag));
      await waitForChanges();

      expect(queryDisplay(root, region)).not.toBe('none');
      expect(queryAssigned(root, slot)).toHaveLength(1);
    });

    it('hides the region again when the last child is removed', async () => {
      const { root, waitForChanges } = await render(html);
      const child = createSlottedChild(slot, childTag);
      root.appendChild(child);
      await waitForChanges();

      child.remove();
      await waitForChanges();

      expect(queryDisplay(root, region)).toBe('none');
      expect(queryAssigned(root, slot)).toHaveLength(0);
    });
  });
};

export { createSlottedChild, describeConditionalSlot };
