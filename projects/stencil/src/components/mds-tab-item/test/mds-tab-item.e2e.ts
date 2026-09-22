import { render } from '@stencil/vitest';

describe('mds-tab-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tab-item></mds-tab-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('names an icon-only tab after the host title', async () => {
    const { root } = await render('<mds-tab-item title="Dark mode"></mds-tab-item>');
    const tab = root.shadowRoot!.querySelector('mds-button')!;

    expect(tab).toEqualAttributes({ role: 'tab', title: 'Dark mode' });
  });

  it('leaves the tab unnamed by title when the host has none', async () => {
    const { root } = await render('<mds-tab-item label="First"></mds-tab-item>');

    expect(root.shadowRoot!.querySelector('mds-button')).not.toHaveAttribute('title');
  });

  it('puts the state of the popup it opens on the tab, not on its own host', async () => {
    const { root } = await render('<mds-tab-item label="First" expanded></mds-tab-item>');

    // the host is generic and accepts none of the attributes of a caller
    expect(root).not.toHaveAttribute('aria-expanded');
    expect(root.shadowRoot!.querySelector('mds-button')).toEqualAttribute('aria-expanded', 'true');
  });

  it('says nothing about a popup on a tab that opens none', async () => {
    const { root } = await render('<mds-tab-item label="First"></mds-tab-item>');

    expect(root.shadowRoot!.querySelector('mds-button')).not.toHaveAttribute('aria-expanded');
  });
});
