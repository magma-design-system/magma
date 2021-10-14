import { newE2EPage } from '@stencil/core/testing'

describe('mds-header', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-header></mds-header>')

    const element = await page.find('mds-header')
    expect(element).toHaveClass('hydrated')
  })
})
