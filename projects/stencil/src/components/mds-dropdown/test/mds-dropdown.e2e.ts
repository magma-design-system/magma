import { render } from '@stencil/vitest';

describe('mds-dropdown', () => {
  it('renders', async () => {
    const { root } = await render(
      '<mds-dropdown target="#caller">Menu</mds-dropdown><button id="caller">Open</button>',
    );

    expect(root).toHaveAttribute('hydrated');
  });

  it('exposes the caller as the control of the popup', async () => {
    const { root } = await render(
      '<mds-dropdown target="#caller">Menu</mds-dropdown><button id="caller">Open</button>',
    );
    const caller = root.parentElement!.querySelector('#caller')!;

    expect(root).toEqualAttribute('role', 'menu');
    expect(caller).toHaveAttribute('aria-haspopup');
    expect(caller).toHaveAttribute('aria-controls');
  });

  it('leaves an mds-tab-item caller unwired, its tab being the inner button', async () => {
    const { root } = await render(
      '<mds-dropdown target="#caller">Menu</mds-dropdown>' +
        '<mds-tab><mds-tab-item id="caller" label="Tab"></mds-tab-item></mds-tab>',
    );
    const caller = root.parentElement!.querySelector('#caller')!;

    expect(root).toEqualAttribute('role', 'menu');
    expect(caller).not.toHaveAttribute('aria-haspopup');
    expect(caller).not.toHaveAttribute('aria-controls');
  });
});
