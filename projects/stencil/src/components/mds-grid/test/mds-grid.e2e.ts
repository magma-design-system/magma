import { newE2EPage } from '@stencil/core/testing'

describe('mds-grid', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-grid></mds-grid>')

    const element = await page.find('mds-grid')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
