import { render } from '@stencil/vitest';

describe('mds-progress', () => {
  it('renders', async () => {
    const { root } = await render('<mds-progress></mds-progress>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('hides the radial gauge from assistive technology, the host is the progressbar', async () => {
    const { root } = await render(
      '<mds-progress direction="radial" progress="0.35"></mds-progress>',
    );

    expect(root).toEqualAttributes({ role: 'progressbar', 'aria-valuenow': '35' });
    expect(root.shadowRoot!.querySelector('mds-radial-progress')).toEqualAttribute(
      'aria-hidden',
      'true',
    );
  });

  // aria-hidden was read once at load, and a value above 1 named a step past the last one
  // ("undefined") with a percentage above 100 (#821)
  describe('the progressbar', () => {
    it('names the step it has reached', async () => {
      const { root } = await render('<mds-progress progress="0.25"></mds-progress>');

      expect(root).toEqualAttributes({
        role: 'progressbar',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': '25',
        'aria-valuetext': 'Un quarto',
      });
    });

    it.each([
      ['1.5', '100', 'Fine'],
      ['-0.2', '0', 'Inizio'],
    ])('reads %s as its nearest end', async (progress, now, text) => {
      const { root } = await render(`<mds-progress progress="${progress}"></mds-progress>`);

      expect(root).toEqualAttributes({ 'aria-valuenow': now, 'aria-valuetext': text });
    });

    it('stops being a progressbar while aria-hidden, and becomes one again', async () => {
      const { root, waitForChanges } = await render(
        '<mds-progress progress="0.5" aria-hidden="true"></mds-progress>',
      );

      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('aria-valuenow');
      expect(root).not.toHaveAttribute('aria-valuetext');

      root.removeAttribute('aria-hidden');
      await waitForChanges();
      expect(root).toEqualAttributes({ role: 'progressbar', 'aria-valuenow': '50' });

      root.setAttribute('aria-hidden', 'true');
      await waitForChanges();
      expect(root).not.toHaveAttribute('role');
    });

    it('keeps the aria-valuetext of the author', async () => {
      const { root, waitForChanges } = await render<HTMLMdsProgressElement>(
        '<mds-progress progress="0.5" aria-valuetext="3 of 6"></mds-progress>',
      );

      expect(root).toEqualAttribute('aria-valuetext', '3 of 6');
      root.setAttribute('progress', '0.75');
      await waitForChanges();
      expect(root).toEqualAttribute('aria-valuetext', '3 of 6');
    });
  });

  // #988: the radius of the bar was documented and read by nothing
  it('takes the radius set on --mds-progress-radius', async () => {
    const { root } = await render(
      '<mds-progress style="--mds-progress-radius: 3px"></mds-progress>',
    );

    expect(getComputedStyle(root).borderTopLeftRadius).toBe('3px');
  });
});
