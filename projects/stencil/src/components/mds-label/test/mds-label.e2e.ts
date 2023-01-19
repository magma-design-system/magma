import { newE2EPage } from '@stencil/core/testing'

describe('mds-label', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-label></mds-label>')

    const element = await page.find('mds-label')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
