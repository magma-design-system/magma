import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';

const LABEL = 'ETICHETTA CON CEDIGLIA E ACCENTO, VIRGOLA';
const SIZED = 'box-sizing: border-box; width: 200px';

/**
 * Renders the labels inside a container of the given width, waits for each of them and for the
 * mds-text inside, and returns them. The page of these tests loads no styles reset: the container
 * sets the overflow-wrap: anywhere the reset gives every element, and the labels inherit it; a
 * label given a width of its own sets the border-box sizing of the reset too.
 */
const renderLabels = async (width: number, labels: string): Promise<HTMLMdsLabelElement[]> => {
  const { root } = await render<HTMLDivElement>(
    `<div style="width: ${width}px; overflow-wrap: anywhere">${labels}</div>`,
  );
  const hosts = [...root.querySelectorAll<HTMLMdsLabelElement>('mds-label')];

  await vi.waitFor(() => {
    hosts.forEach((host) => {
      expect(host).toHaveAttribute('hydrated');
      expect(host.shadowRoot!.querySelector('mds-text')).toHaveAttribute('hydrated');
    });
  });

  return hosts;
};

const textBox = (label: HTMLMdsLabelElement): DOMRect =>
  label.shadowRoot!.querySelector('mds-text')!.getBoundingClientRect();

describe('mds-label', () => {
  it('renders', async () => {
    const { root } = await render('<mds-label></mds-label>');

    expect(root).toHaveAttribute('hydrated');
  });

  describe('deletable', () => {
    beforeEach(mockIconFetch);

    // #825: the label looked for a `.close` button that is not there and threw on load and on
    // every update
    it('loads and updates without an error', async () => {
      const consoleError = vi.spyOn(console, 'error');
      const { root, waitForChanges } = await render(
        '<mds-label deletable label="Draft"></mds-label>',
      );

      root.setAttribute('label', 'Published');
      await waitForChanges();

      expect(root.shadowRoot!.querySelector('.button-close')).not.toBeNull();
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('emits mdsLabelDelete once for Enter on the delete button', async () => {
      const { root } = await render('<mds-label deletable label="Draft"></mds-label>');
      const deleted = vi.fn();
      root.addEventListener('mdsLabelDelete', deleted);

      root.shadowRoot!.querySelector<HTMLMdsButtonElement>('.button-close')!.focus();
      await userEvent.keyboard('{Enter}');

      expect(deleted).toHaveBeenCalledTimes(1);
    });
  });

  // #1008: the host was capped at its min-content width. With the text allowed to wrap, that is
  // the narrowest box the text fits in: the longest word, or a single letter under the
  // overflow-wrap: anywhere of the styles reset, so the label became a column of letters
  // whatever width it was given. A label that truncates on one line never showed it, its
  // min-content being the whole text.
  describe('a label whose text wraps', () => {
    it.each(['none', 'all'])(
      'with truncate="%s" takes the width it is given and wraps the text in it',
      async (truncate) => {
        const [wrapping, oneLine] = await renderLabels(
          400,
          `<mds-label label="${LABEL}" truncate="${truncate}" style="${SIZED}"></mds-label>
           <mds-label label="${LABEL}" style="${SIZED}"></mds-label>`,
        );
        const host = wrapping.getBoundingClientRect();
        const text = textBox(wrapping);
        const line = textBox(oneLine).height;

        expect(Math.abs(host.width - 200)).toBeLessThanOrEqual(1);
        // the text fills the label, minus its padding, on a few lines and not on one per letter
        expect(text.width).toBeGreaterThan(host.width / 2);
        expect(text.height).toBeGreaterThan(line * 1.5);
        expect(text.height).toBeLessThan(line * 5);
      },
    );

    it('wraps at the width of its container', async () => {
      const [label] = await renderLabels(
        200,
        `<mds-label label="${LABEL}" truncate="none"></mds-label>`,
      );

      expect(Math.abs(label.getBoundingClientRect().width - 200)).toBeLessThanOrEqual(1);
      expect(textBox(label).width).toBeGreaterThan(100);
    });

    it('is as wide as its text when the text fits, like a label that truncates', async () => {
      const [wrapping, truncating] = await renderLabels(
        400,
        `<mds-label label="Etichetta breve" truncate="none"></mds-label>
         <mds-label label="Etichetta breve"></mds-label>`,
      );
      const wrappingBox = wrapping.getBoundingClientRect();
      const truncatingBox = truncating.getBoundingClientRect();

      expect(wrappingBox.width).toBeLessThan(400);
      expect(Math.abs(wrappingBox.width - truncatingBox.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(wrappingBox.height - truncatingBox.height)).toBeLessThanOrEqual(1);
    });
  });
});
