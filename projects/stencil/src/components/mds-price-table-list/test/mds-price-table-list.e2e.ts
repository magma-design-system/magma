import { newE2EPage } from '@stencil/core/testing'

describe('mds-price-table-list', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-price-table-list></mds-price-table-list>')

    const element = await page.find('mds-price-table-list')
    expect(element).toHaveAttribute('hydrated')
  })
})
