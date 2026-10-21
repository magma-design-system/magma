import { render } from '@stencil/vitest';

describe('mds-list-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-list-item></mds-list-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #932: the host used to paint itself muted, so a list never followed the colour of its container
  it('takes the text colour of its container, for the text and the icon', async () => {
    const { root } = await render(
      '<div style="color: rgb(12, 34, 56)"><mds-list><mds-list-item>Pane</mds-list-item></mds-list></div>',
    );
    const item = root.querySelector('mds-list-item')!;
    const text = item.shadowRoot!.querySelector('mds-text')!;
    const icon = item.shadowRoot!.querySelector('mds-icon')!;

    expect(getComputedStyle(item).color).toBe('rgb(12, 34, 56)');
    expect(getComputedStyle(text).color).toBe('rgb(12, 34, 56)');
    expect(getComputedStyle(icon).fill).toBe('rgb(12, 34, 56)');
  });
});
