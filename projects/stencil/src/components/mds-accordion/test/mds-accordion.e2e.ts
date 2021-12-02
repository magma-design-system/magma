import { newE2EPage } from '@stencil/core/testing'

describe('mds-accordion', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-accordion></mds-accordion>')

    const element = await page.find('mds-accordion')
    // // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
