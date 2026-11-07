import { render } from '@stencil/vitest';
import axe from 'axe-core';
import { userEvent } from 'vitest/browser';

describe('mds-accordion-item', () => {
  it('should hydrate', async () => {
    const { root } = await render('<mds-accordion-item></mds-accordion-item>');

    expect(root).toHaveAttribute('hydrated');
  });

  it('should renders label', async () => {
    const { root } = await render<HTMLMdsAccordionItemElement>(
      '<mds-accordion-item label="titolo"></mds-accordion-item>',
    );

    expect(root.label).toBe('titolo');
  });

  // an item is a part of the page, styled as h6 (titles/part, #1189): the guides write it until
  // the default moves from h5 with the next major (#1218)
  it('styles its title as the typography written', async () => {
    const { root } = await render(
      '<mds-accordion-item label="titolo" typography="h6"></mds-accordion-item>',
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
      '<mds-accordion-item label="titolo" typography="h6"></mds-accordion-item>',
    );

    const button = root.shadowRoot!.querySelector('button')!;
    for (const part of ['label', 'icon'])
      expect(button.querySelector(`[part="${part}"]`)!.shadowRoot!.firstElementChild!.tagName).toBe(
        'SPAN',
      );
  });

  it('is not a heading with no tag', async () => {
    const { root } = await render(
      '<mds-accordion-item label="titolo" typography="h6"></mds-accordion-item>',
    );

    expect(root.shadowRoot!.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
    expect(root.shadowRoot!.querySelector('button')!.parentNode).toBe(root.shadowRoot);
  });

  // the Accordion pattern of the WAI-ARIA Authoring Practices: the heading wraps the button
  it('wraps the button in the heading of its tag', async () => {
    const { root } = await render(
      '<mds-accordion-item label="titolo" typography="h6" tag="h3"></mds-accordion-item>',
    );

    expect(root.shadowRoot!.querySelector('button')!.parentElement!.tagName).toBe('H3');
  });

  // the outline the guides write (usage/2. Examples.md): the items under the title h2 of their
  // section, out of the outline or in it at the next level
  for (const tag of ['', 'h3'])
    it(`keeps the outline of the page ${tag ? `as ${tag}` : 'out of it'}`, async () => {
      const item = (label: string): string =>
        `<mds-accordion-item label="${label}" typography="h6"${tag ? ` tag="${tag}"` : ''}>
          <mds-text>Testo</mds-text>
        </mds-accordion-item>`;
      const { waitForChanges } = await render(`
        <div>
          <mds-text typography="section" tag="h2">Domande frequenti</mds-text>
          <mds-accordion>
            ${item('Come gestisco gli aggiornamenti?')}
            ${item('Posso personalizzare i colori?')}
          </mds-accordion>
        </div>
      `);
      await waitForChanges();

      const { violations } = await axe.run(document, {
        runOnly: { type: 'rule', values: ['empty-heading', 'heading-order'] },
      });
      expect(violations.map(({ id }) => id)).toEqual([]);
    });

  it('should not render contents', async () => {
    const { root } = await render('<mds-accordion-item label="titolo"></mds-accordion-item>');

    const contents = root.shadowRoot!.querySelector('.content')!;
    expect(contents).toBeTruthy();
    expect(getComputedStyle(contents).gridTemplateRows).toBe('0px');
    expect(getComputedStyle(contents).opacity).toBe('0');
  });

  it('should renders selected', async () => {
    const { root } = await render('<mds-accordion-item selected>testo</mds-accordion-item>');

    const contents = root.shadowRoot!.querySelector('.content')!;
    expect(contents).toBeTruthy();
    expect(getComputedStyle(contents).gridTemplateRows).not.toContain('0px');
    expect(getComputedStyle(contents).opacity).toBe('1');
  });

  it('should trigger event', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      '<mds-accordion-item></mds-accordion-item>',
    );
    const spySelect = spyOnEvent('mdsAccordionItemSelect');
    const spyChange = spyOnEvent('mdsAccordionItemChange');
    const spyUnselect = spyOnEvent('mdsAccordionItemUnselect');
    const button = root.shadowRoot!.querySelector('button')!;

    await userEvent.click(button);
    await waitForChanges();
    expect(spyChange).toHaveReceivedEventTimes(1);
    expect(spySelect).toHaveReceivedEventTimes(1);
    expect(spyUnselect).not.toHaveReceivedEvent();

    await userEvent.click(button);
    await waitForChanges();
    expect(spyChange).toHaveReceivedEventTimes(2);
    expect(spySelect).toHaveReceivedEventTimes(1);
    expect(spyUnselect).toHaveReceivedEventTimes(1);
  });
});
