import { render } from '@stencil/vitest';

describe('mds-accordion-timer-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-accordion-timer-item></mds-accordion-timer-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  // an item is a part of the page, styled as h6 (titles/part, #1189): the default since Magma 3
  // (#1218), where it was h5
  it('styles its title as a part by default', async () => {
    const { root } = await render(
      '<mds-accordion-timer-item description="titolo"></mds-accordion-timer-item>',
    );

    for (const part of ['label', 'icon'])
      expect(root.shadowRoot!.querySelector(`[part="${part}"]`)).toEqualAttribute(
        'typography',
        'h6',
      );
  });

  // h5 is how a product keeps the look of Magma 2 (#1218)
  it('styles its title as the typography written', async () => {
    const { root } = await render(
      '<mds-accordion-timer-item description="titolo" typography="h5"></mds-accordion-timer-item>',
    );

    for (const part of ['label', 'icon'])
      expect(root.shadowRoot!.querySelector(`[part="${part}"]`)).toEqualAttribute(
        'typography',
        'h5',
      );
  });
});
