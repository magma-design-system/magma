import { render, vi } from '@stencil/vitest';
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

// #825: the text between the cards of indented markup was taken for an element, and measuring it
// threw in the arrows
describe('mds-horizontal-scroll with indented markup', () => {
  it('moves forward and back over the cards only', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const card = '<div style="flex: 0 0 300px; height: 40px">Card</div>';
    const { root, waitForChanges } = await render(`
      <mds-horizontal-scroll style="width: 400px">
        ${card}
        ${card}
        ${card}
        ${card}
      </mds-horizontal-scroll>
    `);
    const contents = root.shadowRoot!.querySelector<HTMLElement>('.contents')!;

    root.shadowRoot!.querySelector<HTMLElement>('.navigation--forward')!.click();
    await waitForChanges();
    await vi.waitFor(() => expect(contents.scrollLeft).toBeGreaterThan(0));
    root.shadowRoot!.querySelector<HTMLElement>('.navigation--back')!.click();
    await waitForChanges();

    expect(consoleError).not.toHaveBeenCalled();
  });
});
