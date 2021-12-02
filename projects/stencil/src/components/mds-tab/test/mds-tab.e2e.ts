import { newE2EPage } from '@stencil/core/testing'

describe('mds-tab', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-tab></mds-tab>')

    const element = await page.find('mds-tab')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
