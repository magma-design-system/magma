import { newE2EPage } from '@stencil/core/testing'

describe('mds-price-table-features', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-price-table-features></mds-price-table-features>')

    const element = await page.find('mds-price-table-features')
    expect(element).toHaveClass('hydrated')
  })
})
