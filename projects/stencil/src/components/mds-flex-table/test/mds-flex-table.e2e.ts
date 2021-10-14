import { newE2EPage } from '@stencil/core/testing'

describe('mds-flex-table', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-flex-table></mds-flex-table>')

    const element = await page.find('mds-flex-table')
    expect(element).toHaveClass('hydrated')
  })
})
