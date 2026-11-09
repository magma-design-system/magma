import { render } from '@stencil/vitest';
import axe from 'axe-core';

describe('mds-accordion-timer-item', () => {
  it('renders', async () => {
    const { root } = await render('<mds-accordion-timer-item></mds-accordion-timer-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  // an item is a part of the page, styled as h6 (titles/part, #1189): the guides write it until
  // the default moves from h5 with the next major (#1218)
  it('styles its title as the typography written', async () => {
    const { root } = await render(
      '<mds-accordion-timer-item description="titolo" typography="h6"></mds-accordion-timer-item>',
    );

    for (const part of ['label', 'icon'])
      expect(root.shadowRoot!.querySelector(`[part="${part}"]`)).toEqualAttribute(
        'typography',
        'h6',
      );
  });

  // a button holds phrasing content only (HTML, the button element): a heading inside it is
  // invalid, and Chromium still lists it among the headings of the page
  it('renders its texts as spans inside the button', async () => {
    const { root } = await render(
      '<mds-accordion-timer-item description="titolo" typography="h6"></mds-accordion-timer-item>',
    );

    const button = root.shadowRoot!.querySelector('button')!;
    for (const part of ['label', 'icon'])
      expect(button.querySelector(`[part="${part}"]`)!.shadowRoot!.firstElementChild!.tagName).toBe(
        'SPAN',
      );
  });

  it('is not a heading with no tag', async () => {
    const { root } = await render(
      '<mds-accordion-timer-item description="titolo" typography="h6"></mds-accordion-timer-item>',
    );

    expect(root.shadowRoot!.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
    expect(root.shadowRoot!.querySelector('button')!.parentElement).toHaveClass('accordion');
  });

  // the Accordion pattern of the WAI-ARIA Authoring Practices: the heading wraps the button
  it('wraps the button in the heading of its tag', async () => {
    const { root } = await render(
      '<mds-accordion-timer-item description="titolo" typography="h6" tag="h3"></mds-accordion-timer-item>',
    );

    expect(root.shadowRoot!.querySelector('button')!.parentElement!.tagName).toBe('H3');
  });

  // the outline the guides write (usage/2. Examples.md): the items under the title h2 of their
  // section, out of the outline or in it at the next level
  for (const tag of ['', 'h3'])
    it(`keeps the outline of the page ${tag ? `as ${tag}` : 'out of it'}`, async () => {
      const item = (description: string): string =>
        `<mds-accordion-timer-item description="${description}" typography="h6"${tag ? ` tag="${tag}"` : ''}>
          <mds-text>Testo</mds-text>
        </mds-accordion-timer-item>`;
      const { waitForChanges } = await render(`
        <div>
          <mds-text typography="section" tag="h2">Come funziona</mds-text>
          <mds-accordion-timer>
            ${item('Argomento principale')}
            ${item('Sotto-argomento')}
          </mds-accordion-timer>
        </div>
      `);
      await waitForChanges();

      const { violations } = await axe.run(document, {
        runOnly: { type: 'rule', values: ['empty-heading', 'heading-order'] },
      });
      expect(violations.map(({ id }) => id)).toEqual([]);
    });
});
