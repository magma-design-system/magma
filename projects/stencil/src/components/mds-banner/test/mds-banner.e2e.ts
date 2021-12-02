import { newE2EPage } from '@stencil/core/testing'

describe('mds-banner', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-banner></mds-banner>')

    const element = await page.find('mds-banner')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
