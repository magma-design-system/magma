import { newE2EPage } from '@stencil/core/testing';

describe('mds-push-notification', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-push-notification></mds-push-notification>');

    const element = await page.find('mds-push-notification');
    expect(element).toHaveAttribute('hydrated');
  });

  it('hides and emits mdsPushNotificationHide when the clear button is clicked', async () => {
    const page = await newE2EPage();
    await page.setContent('<mds-push-notification visible></mds-push-notification>');
    const hideSpy = await page.spyOnEvent('mdsPushNotificationHide');

    const clearButton = await page.find('mds-push-notification >>> mds-button');
    await clearButton.click();
    await page.waitForChanges();

    expect(hideSpy).toHaveReceivedEventTimes(1);

    const element = await page.find('mds-push-notification');
    expect(element).not.toHaveAttribute('visible');
  });
});
