import { render } from '@stencil/vitest';
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

  // an item is a part of the page, styled as h6 (titles/part, #1189): the default since Magma 3
  // (#1218), where it was h5
  it('styles its title as a part by default', async () => {
    const { root } = await render('<mds-accordion-item label="titolo"></mds-accordion-item>');

    for (const part of ['label', 'icon'])
      expect(root.shadowRoot!.querySelector(`[part="${part}"]`)).toEqualAttribute(
        'typography',
        'h6',
      );
  });

  // h5 is how a product keeps the look of Magma 2 (#1218)
  it('styles its title as the typography written', async () => {
    const { root } = await render(
      '<mds-accordion-item label="titolo" typography="h5"></mds-accordion-item>',
    );

    for (const part of ['label', 'icon'])
      expect(root.shadowRoot!.querySelector(`[part="${part}"]`)).toEqualAttribute(
        'typography',
        'h5',
      );
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
