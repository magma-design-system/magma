import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

const closeButton = (root: HTMLElement): HTMLElement =>
  root.shadowRoot!.querySelector('.action-close') as HTMLElement;

describe('mds-url-view', () => {
  describe('close button', () => {
    // #1356: mds-button clicks on Enter by itself, a handler of the view on top of it clicked a
    // second time
    it('closes once with Enter on the close button', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(
        '<mds-url-view src="about:blank"></mds-url-view>',
      );
      const close = spyOnEvent('mdsUrlViewClose');

      closeButton(root).focus();
      await userEvent.keyboard('{Enter}');
      await waitForChanges();

      expect(close).toHaveReceivedEventTimes(1);
    });

    // a node moved in the page is disconnected and connected again, without loading again: the
    // close button keeps its Enter, once (#1356)
    it('closes once with Enter on the close button of a view moved in the page', async () => {
      const { root, spyOnEvent, waitForChanges } = await render(
        '<div><mds-url-view src="about:blank"></mds-url-view><section></section></div>',
      );
      const view = root.querySelector('mds-url-view')!;
      const close = spyOnEvent('mdsUrlViewClose');

      root.querySelector('section')!.append(view);
      await waitForChanges();
      closeButton(view).focus();
      await userEvent.keyboard('{Enter}');
      await waitForChanges();

      expect(close).toHaveReceivedEventTimes(1);
    });
  });
});
