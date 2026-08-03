import { newE2EPage } from '@stencil/core/testing';

describe('mds-accordion', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-accordion></mds-accordion>');

    const component = await page.find('mds-accordion');
    expect(component).toHaveAttribute('hydrated');
  });

  it('multiple select', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <mds-accordion multiple>
        <mds-accordion-item label="primo"></mds-accordion-item>
        <mds-accordion-item label="secondo"></mds-accordion-item>
      </mds-accordion>`);

    const component = await page.find('mds-accordion');
    const [item1, item2] = await component.findAll('mds-accordion-item');

    await item1.click();
    await item2.click();

    expect(item1).toHaveAttribute('selected');
    expect(item2).toHaveAttribute('selected');
  });

  it('should not be closable when disable-close is set', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <mds-accordion disable-close>
        <mds-accordion-item label="primo"></mds-accordion-item>
        <mds-accordion-item label="secondo"></mds-accordion-item>
      </mds-accordion>`);

    const component = await page.find('mds-accordion');
    const [item1, item2] = await component.findAll('mds-accordion-item');

    await item1.click();
    expect(item1).toHaveAttribute('selected');

    await item2.click();
    expect(item1).not.toHaveAttribute('selected');
    expect(item2).toHaveAttribute('selected');

    // should not been closed
    await item2.click();
    expect(item2).toHaveAttribute('selected');
  });

  it('should keep at least one item open in multiple mode when disable-close is set', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <mds-accordion multiple disable-close>
        <mds-accordion-item label="primo"></mds-accordion-item>
        <mds-accordion-item label="secondo"></mds-accordion-item>
      </mds-accordion>`);

    const component = await page.find('mds-accordion');
    const [item1, item2] = await component.findAll('mds-accordion-item');

    await item1.click();
    await item2.click();
    expect(item1).toHaveAttribute('selected');
    expect(item2).toHaveAttribute('selected');

    // closing one item while another stays open is allowed
    await item2.click();
    expect(item1).toHaveAttribute('selected');
    expect(item2).not.toHaveAttribute('selected');

    // closing the last open item is prevented
    await item1.click();
    expect(item1).toHaveAttribute('selected');
  });
});
