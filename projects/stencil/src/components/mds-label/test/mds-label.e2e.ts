import { render, vi } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';
import { mockIconFetch } from '@test/fetch';

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
});
