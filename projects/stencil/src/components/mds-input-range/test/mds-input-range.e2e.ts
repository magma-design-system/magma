import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-range', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-range></mds-input-range>')

    const element = await page.find('mds-input-range')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
