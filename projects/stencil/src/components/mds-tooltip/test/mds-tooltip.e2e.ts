import { render } from '@stencil/vitest';

describe('mds-tooltip', () => {
  it('renders', async () => {
    const { root } = await render('<mds-tooltip target="#caller"></mds-tooltip>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('describes its caller as a tooltip, not as a menu the caller controls', async () => {
    const { root } = await render(
      '<mds-tooltip target="#caller">Hint</mds-tooltip><button id="caller">Open</button>',
    );
    const caller = root.parentElement!.querySelector('#caller')!;

    expect(root).toEqualAttribute('role', 'tooltip');
    expect(root).not.toHaveAttribute('aria-labelledby');
    expect(caller).not.toHaveAttribute('aria-haspopup');
    expect(caller).not.toHaveAttribute('aria-controls');
  });
});
