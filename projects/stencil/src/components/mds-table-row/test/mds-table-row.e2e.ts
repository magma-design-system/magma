import { newE2EPage } from '@stencil/core/testing'

describe('mds-table-row', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-table-row></mds-table-row>')

    const element = await page.find('mds-table-row')
    expect(element).toHaveClass('hydrated')
  })
})
