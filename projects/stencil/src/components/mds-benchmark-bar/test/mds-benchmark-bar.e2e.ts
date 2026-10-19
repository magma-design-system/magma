import { render } from '@stencil/vitest';
import { itReadsTheSlottedLabelWhenLabelIsNull } from '@test/slot';

describe('mds-benchmark-bar', () => {
  it('renders', async () => {
    const { root } = await render('<mds-benchmark-bar></mds-benchmark-bar>');

    expect(root).toHaveAttribute('hydrated');
  });

  itReadsTheSlottedLabelWhenLabelIsNull('mds-benchmark-bar');

  // above 100 the bar handed its progress a value past 1 (aria-valuetext "undefined",
  // aria-valuenow above 100), and the alias never reached the spoken value (#821)
  describe('the progressbar inside', () => {
    const progress = (root: HTMLElement) => root.shadowRoot!.querySelector('mds-progress')!;

    it('stops at 100 for a value above it', async () => {
      const { root } = await render(
        '<mds-benchmark-bar label="CPU" value="140"></mds-benchmark-bar>',
      );

      expect(progress(root)).toEqualAttribute('aria-valuenow', '100');
      expect(progress(root).getAttribute('aria-valuetext')).not.toBe('undefined');
    });

    it('speaks the alias as the value', async () => {
      const { root } = await render(
        '<mds-benchmark-bar label="Storage" value="60" alias="6 GB of 10"></mds-benchmark-bar>',
      );

      expect(progress(root)).toEqualAttribute('aria-valuetext', '6 GB of 10');
    });

    // #983: without an alias the progress announced one of its steps, in Italian
    it('speaks the value as shown when there is no alias', async () => {
      const { root } = await render(
        '<mds-benchmark-bar label="Tasks completed" value="33"></mds-benchmark-bar>',
      );

      expect(progress(root)).toEqualAttribute('aria-valuetext', '33');
    });

    it('follows a new value, and the value once the alias is removed', async () => {
      const { root, waitForChanges } = await render(
        '<mds-benchmark-bar label="Tasks completed" value="33" alias="1 of 3"></mds-benchmark-bar>',
      );

      root.setAttribute('alias', '2 of 3');
      root.setAttribute('value', '66');
      await waitForChanges();
      expect(progress(root)).toEqualAttribute('aria-valuetext', '2 of 3');

      root.removeAttribute('alias');
      await waitForChanges();
      expect(progress(root)).toEqualAttribute('aria-valuetext', '66');
      expect(root.shadowRoot!.querySelector('.value')?.textContent).toBe('66');
    });
  });
});
