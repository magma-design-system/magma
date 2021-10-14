import { newE2EPage } from '@stencil/core/testing'

describe('mds-table-body', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-table-body></mds-table-body>')

    const element = await page.find('mds-table-body')
    expect(element).toHaveClass('hydrated')
  })
})
