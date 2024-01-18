import { newE2EPage } from '@stencil/core/testing'

describe('mds-push-notification', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-push-notification></mds-push-notification>')

    const element = await page.find('mds-push-notification')
    expect(element).toHaveAttribute('hydrated')
  })
})
