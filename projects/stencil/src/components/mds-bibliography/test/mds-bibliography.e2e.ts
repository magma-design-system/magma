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

  it('keeps the first name of an author after the first one', async () => {
    const { root } = await render(
      '<mds-bibliography format="mla" author="Mario Rossi, Luigi Verdi" name="Republic"></mds-bibliography>',
    );

    const author = root.shadowRoot!.querySelector('mds-text > span:first-child')!;
    expect(author.textContent).toBe('Rossi, Mario, e Verdi, Luigi');
  });

  it.each(['apa', 'mla', 'turabian'])(
    'links the title only with a url in %s format',
    async (format) => {
      const { root } = await render(
        `<mds-bibliography format="${format}" author="Plato" name="Republic"></mds-bibliography>`,
      );

      expect(root.shadowRoot!.querySelector('a')).toBeNull();
      expect(root.shadowRoot!.querySelector('b > i')!.textContent!.trim()).toBe('Republic.');
    },
  );

  it.each(['apa', 'mla', 'turabian'])(
    'renders no title without a name in %s format',
    async (format) => {
      const { root } = await render(
        `<mds-bibliography format="${format}" author="Plato" url="https://example.com"></mds-bibliography>`,
      );

      expect(root.shadowRoot!.querySelector('b')).toBeNull();
      expect(root.shadowRoot!.querySelector('a')).toBeNull();
    },
  );

  // #825: the description promised an array, and an array set from a script threw
  it('reads an array of authors set from a script as one author per entry', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const { root, waitForChanges } = await render(`
      <div>
        <mds-bibliography class="array" format="mla" name="Republic"></mds-bibliography>
        <mds-bibliography class="string" format="mla" name="Republic" author="Plato,Mario Rossi"></mds-bibliography>
      </div>
    `);
    const authors = (selector: string): string =>
      root.querySelector(selector)!.shadowRoot!.querySelector('mds-text > span:first-child')!
        .textContent!;

    (root.querySelector('.array') as { author?: string | string[] }).author = [
      'Plato',
      'Mario Rossi',
    ];
    await waitForChanges();

    expect(consoleError).not.toHaveBeenCalled();
    expect(authors('.array')).toBe(authors('.string'));
    expect(authors('.array')).toContain('Mario');
  });
});
