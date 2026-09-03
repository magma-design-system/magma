import { render } from '@stencil/vitest';

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
});
