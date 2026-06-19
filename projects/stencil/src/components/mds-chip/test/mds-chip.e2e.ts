import { newE2EPage } from '@stencil/core/testing';

describe('mds-chip', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-chip></mds-chip>');

    const element = await page.find('mds-chip');
    expect(element).toHaveAttribute('hydrated');
  });

  it('emits mdsChipDelete when the delete button is clicked', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-chip label="chip" deletable></mds-chip>');
    const deleteSpy = await page.spyOnEvent('mdsChipDelete');

    const deleteButton = await page.find('mds-chip >>> .button-delete');
    await deleteButton.click();
    await page.waitForChanges();

    expect(deleteSpy).toHaveReceivedEventTimes(1);
  });
});
