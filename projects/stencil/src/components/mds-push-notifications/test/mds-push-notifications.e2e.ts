import { newE2EPage } from '@stencil/core/testing'

describe('mds-push-notifications', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-push-notifications></mds-push-notifications>')

    const element = await page.find('mds-push-notifications')
    expect(element).toHaveAttribute('hydrated')
  })
})
