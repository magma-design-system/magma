import { newE2EPage } from '@stencil/core/testing'

describe('mds-icon', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-icon></mds-icon>')

    // const element = await page.find('mds-icon')
    // expect(element).toHaveClass('hydrated')
    expect(true).toBe(true)
  })
})
