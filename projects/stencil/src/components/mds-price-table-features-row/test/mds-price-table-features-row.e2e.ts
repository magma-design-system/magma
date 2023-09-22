import { newE2EPage } from '@stencil/core/testing'

describe('mds-price-table-features-row', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-price-table-features-row></mds-price-table-features-row>')

    const element = await page.find('mds-price-table-features-row')
    expect(element).toHaveClass('hydrated')
  })
})
