import { newE2EPage } from '@stencil/core/testing'

describe('mds-price-table-header', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-price-table-header></mds-price-table-header>')

    const element = await page.find('mds-price-table-header')
    expect(element).toHaveAttribute('hydrated')
  })
})
