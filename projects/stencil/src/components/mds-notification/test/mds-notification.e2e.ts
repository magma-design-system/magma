import { newE2EPage } from '@stencil/core/testing'

describe('mds-notification', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-notification visible></mds-notification>')
    const element = await page.find('mds-notification')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
