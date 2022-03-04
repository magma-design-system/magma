import { newE2EPage } from '@stencil/core/testing'

describe('mds-icon-svg', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-icon-svg></mds-icon-svg>')

    const element = await page.find('mds-icon-svg')
    expect(element).toHaveClass('hydrated')
  })
})
