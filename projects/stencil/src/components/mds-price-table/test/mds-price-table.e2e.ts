import { newE2EPage } from '@stencil/core/testing'

describe('mds-price-table', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-price-table></mds-price-table>')

    const element = await page.find('mds-price-table')
    expect(element).toHaveClass('hydrated')
  })
})
