import { newE2EPage } from '@stencil/core/testing'

describe('mds-price-table-list-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-price-table-list-item></mds-price-table-list-item>')

    const element = await page.find('mds-price-table-list-item')
    expect(element).toHaveAttribute('hydrated')
  })
})
