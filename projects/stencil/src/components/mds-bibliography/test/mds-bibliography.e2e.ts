import { render, vi } from '@stencil/vitest';

describe('mds-bibliography', () => {
  it('renders', async () => {
    const { root } = await render('<mds-bibliography></mds-bibliography>');

    expect(root).toHaveAttribute('hydrated');
  });

  it.each([
    ['apa', 'P.'],
    ['mla', 'Plato'],
    ['turabian', 'Plato'],
  ])('renders a one-word author in %s format', async (format, expected) => {
    const consoleError = vi.spyOn(console, 'error');
    const { root } = await render(
      `<mds-bibliography format="${format}" author="Plato" name="Republic"></mds-bibliography>`,
    );

    const author = root.shadowRoot!.querySelector('mds-text > span:first-child')!;
    expect(author.textContent!.trim()).toBe(expected);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('does not link the title once the name is removed', async () => {
    const { root, waitForChanges } = await render(
      '<mds-bibliography format="mla" name="Republic" url="https://example.com"></mds-bibliography>',
    );
    expect(root.shadowRoot!.querySelector('a.link')).not.toBeNull();

    root.removeAttribute('name');
    await waitForChanges();

    expect(root.shadowRoot!.querySelector('a.link')).toBeNull();
  });
});
