import { newE2EPage } from '@stencil/core/testing'

describe('mds-table-header-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-table-header-cell></mds-table-header-cell>')

    const element = await page.find('mds-table-header-cell')
    expect(element).toHaveAttribute('hydrated')
  })
})
