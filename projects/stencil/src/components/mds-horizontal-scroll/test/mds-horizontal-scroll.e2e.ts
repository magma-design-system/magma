import { render } from '@stencil/vitest';
import { useLanguage } from '@test/language';

describe('mds-horizontal-scroll', () => {
  it('renders', async () => {
    const { root } = await render('<mds-horizontal-scroll></mds-horizontal-scroll>');

    expect(root).toHaveAttribute('hydrated');
  });
});

// #937: the arrows are icon-only buttons
describe('mds-horizontal-scroll arrows', () => {
  useLanguage('it');

  it('are buttons named in the current language', async () => {
    const { root } = await render('<mds-horizontal-scroll><div>Uno</div></mds-horizontal-scroll>');

    expect(root.shadowRoot!.querySelector('.navigation--back')).toEqualAttributes({
      role: 'button',
      'aria-label': 'Scorri indietro',
    });
    expect(root.shadowRoot!.querySelector('.navigation--forward')).toEqualAttributes({
      role: 'button',
      'aria-label': 'Scorri avanti',
    });
  });
});
