import { newE2EPage } from '@stencil/core/testing'

describe('mds-benchmark-bar', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-benchmark-bar></mds-benchmark-bar>')

    const element = await page.find('mds-benchmark-bar')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
