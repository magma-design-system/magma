import { render, vi } from '@stencil/vitest';
import { TypographyType } from '@type/typography';

describe('mds-text', () => {
  const titleTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'action'];
  const infoTypes = ['paragraph', 'detail', 'caption', 'label', 'option', 'tip'];
  const monoTypes = ['snippet', 'hack'];
  const typographies = [...titleTypes, ...infoTypes, ...monoTypes];

  const readVariants = ['detail', 'caption', 'paragraph'];

  const textContent = 'Test text';

  let element: HTMLMdsTextElement;
  let waitForChanges: () => Promise<void>;

  beforeEach(async () => {
    ({ root: element, waitForChanges } = await render<HTMLMdsTextElement>(
      `<mds-text>${textContent}</mds-text>`,
    ));
  });

  it('renders default', async () => {
    expect(element).toHaveAttribute('hydrated');
    expect(element).toEqualAttribute('typography', 'detail');
    expect(element.textContent).toEqual(textContent);
  });

  it.each(typographies)('renders typography %s', async (typography: TypographyType) => {
    element.typography = typography;
    await waitForChanges();

    expect(element).toEqualAttribute('typography', typography);
  });

  it.each(readVariants)(
    'renders typography %s in variant read',
    async (typography: TypographyType) => {
      element.typography = typography;
      element.variant = 'read';
      await waitForChanges();

      expect(element).toEqualAttribute('typography', typography);
      expect(element).toEqualAttribute('variant', 'read');
    },
  );

  it('falls back to the default tag for an unknown typography', async () => {
    const { root } = await render(`<mds-text typography="title">${textContent}</mds-text>`);

    expect(root).toHaveAttribute('hydrated');
    expect(root).toEqualAttribute('tag', 'p');
    expect(root.textContent).toEqual(textContent);
  });

  it('does not throw when the typography attribute is removed after hydration', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    element.removeAttribute('typography');
    await waitForChanges();

    expect(consoleError).not.toHaveBeenCalled();
  });
});
