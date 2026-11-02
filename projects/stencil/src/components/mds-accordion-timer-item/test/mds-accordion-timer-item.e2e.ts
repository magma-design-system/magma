import { render } from '@stencil/vitest';

describe('mds-accordion-timer-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-accordion-timer-item></mds-accordion-timer-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  // an item is a part of the page, styled as h6 (titles/part, #1189): the guides write it until
  // the default moves from h5 with the next major (#1218)
  it('styles its title as the typography written', async () => {
    const { root } = await render(
      '<mds-accordion-timer-item description="titolo" typography="h6"></mds-accordion-timer-item>',
    );

    for (const part of ['label', 'icon'])
      expect(root.shadowRoot!.querySelector(`[part="${part}"]`)).toEqualAttribute(
        'typography',
        'h6',
      );
  });
});
