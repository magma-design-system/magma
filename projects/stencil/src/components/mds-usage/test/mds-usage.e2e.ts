import { render } from '@stencil/vitest';
import { mockIconFetch } from '@test/fetch';

/** The `name` the header passes to its mds-icon. */
const headerIcon = (root: HTMLElement): string =>
  root.shadowRoot!.querySelector<HTMLMdsIconElement>('mds-icon[part="icon"]')!.name!;

/** Renders a usage block and reads its header icon straight away. */
const renderedIcon = async (attributes = ''): Promise<string> => {
  const { root } = await render(`<mds-usage ${attributes}>Content</mds-usage>`);
  return headerIcon(root);
};

const variants = ['do', 'dont', 'info', 'warn'];

describe('mds-usage', () => {
  beforeEach(() => {
    mockIconFetch();
  });

  describe('the header icon', () => {
    it('is a different icon for each variant', async () => {
      const icons: string[] = [];
      for (const variant of variants) {
        icons.push(await renderedIcon(`variant="${variant}"`));
      }

      icons.forEach((icon) => expect(icon).toContain('<svg'));
      expect(new Set(icons).size).toBe(variants.length);
    });

    it('is the info icon by default and for an unknown variant', async () => {
      const info = await renderedIcon();

      expect(await renderedIcon('variant="error"')).toBe(info);
    });

    it('follows a variant changed at runtime', async () => {
      const { root, waitForChanges } = await render('<mds-usage variant="do">Content</mds-usage>');
      const before = headerIcon(root);

      root.setAttribute('variant', 'dont');
      await waitForChanges();

      expect(headerIcon(root)).not.toBe(before);
    });

    it('is replaced by the icon prop, whatever the variant', async () => {
      expect(await renderedIcon('variant="dont" icon="mi/baseline/account-tree"')).toBe(
        'mi/baseline/account-tree',
      );
    });

    it('falls back to the variant icon when the icon prop is empty', async () => {
      const unset = await renderedIcon('variant="warn"');

      expect(await renderedIcon('variant="warn" icon=""')).toBe(unset);
    });
  });

  // the content was an insertion or a deletion, roles of a document edit (#821)
  it.each(variants)('gives the %s content no role of its own', async (variant) => {
    const { root } = await render(`<mds-usage variant="${variant}">Content</mds-usage>`);

    expect(root.shadowRoot!.querySelector('.content')).not.toHaveAttribute('role');
  });
});
