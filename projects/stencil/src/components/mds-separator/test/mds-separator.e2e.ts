import { render } from '@stencil/vitest';

/**
 * Two roles set to colours the page never takes on its own, so the colour the separator paints
 * says which role its tone reads. The roles are triplets, as the tokens publish them.
 */
const ROLES = '--magma-border-default: 10 20 30; --magma-border-muted: 40 50 60';
const DEFAULT = 'rgb(10, 20, 30)';
const MUTED = 'rgb(40, 50, 60)';

/** The background colour of a separator rendered with `attributes` inside the two roles. */
const paint = async (attributes = ''): Promise<string> => {
  const { root } = await render<HTMLDivElement>(
    `<div style="${ROLES}"><mds-separator ${attributes}></mds-separator></div>`,
  );
  const separator = root.querySelector('mds-separator')!;

  expect(separator).toHaveAttribute('hydrated');

  return getComputedStyle(separator).backgroundColor;
};

describe('mds-separator', () => {
  it('renders', async () => {
    const { root } = await render('<mds-separator></mds-separator>');

    expect(root).toHaveAttribute('hydrated');
  });

  // #1554: the tone picks the border role of the rule
  describe('tone', () => {
    it('is strong by default, and reflects it', async () => {
      const { root } = await render<HTMLMdsSeparatorElement>('<mds-separator></mds-separator>');

      expect(root.tone).toBe('strong');
      expect(root).toHaveAttribute('tone', 'strong');
    });

    it('draws the role of functional outlines when strong, as it did before the tone', async () => {
      expect(await paint()).toBe(DEFAULT);
      expect(await paint('tone="strong"')).toBe(DEFAULT);
    });

    it('draws the role of decorative dividers when weak', async () => {
      expect(await paint('tone="weak"')).toBe(MUTED);
    });

    it('follows the tone when it changes', async () => {
      const { root, waitForChanges } = await render<HTMLDivElement>(
        `<div style="${ROLES}"><mds-separator></mds-separator></div>`,
      );
      const separator = root.querySelector<HTMLMdsSeparatorElement>('mds-separator')!;

      separator.tone = 'weak';
      await waitForChanges();

      expect(separator).toHaveAttribute('tone', 'weak');
      expect(getComputedStyle(separator).backgroundColor).toBe(MUTED);
    });

    it('still gives way to the public property set on the element, in either tone', async () => {
      const style = 'style="--mds-separator-background: rgb(70, 80, 90)"';

      expect(await paint(style)).toBe('rgb(70, 80, 90)');
      expect(await paint(`tone="weak" ${style}`)).toBe('rgb(70, 80, 90)');
    });
  });
});
