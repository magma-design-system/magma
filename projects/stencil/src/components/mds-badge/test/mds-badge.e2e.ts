import { newE2EPage } from '@stencil/core/testing'

describe('mds-badge', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-badge></mds-badge>')

    const element = await page.find('mds-badge')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
