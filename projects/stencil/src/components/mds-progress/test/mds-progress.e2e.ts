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

  // #988: the radius of the bar was documented and read by nothing
  it('takes the radius set on --mds-progress-radius', async () => {
    const { root } = await render(
      '<mds-progress style="--mds-progress-radius: 3px"></mds-progress>',
    );

    expect(getComputedStyle(root).borderTopLeftRadius).toBe('3px');
  });
});
