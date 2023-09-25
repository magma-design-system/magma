import { newE2EPage } from '@stencil/core/testing'

describe('mds-price-table-features-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-price-table-features-cell></mds-price-table-features-cell>')

    const element = await page.find('mds-price-table-features-cell')
    expect(element).toHaveAttribute('hydrated')
  })
})
