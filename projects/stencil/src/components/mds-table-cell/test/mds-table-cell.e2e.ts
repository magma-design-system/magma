import { newE2EPage } from '@stencil/core/testing'

describe('mds-table-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-table-cell></mds-table-cell>')

    const element = await page.find('mds-table-cell')
    expect(element).toHaveClass('hydrated')
  })
})
