import { newE2EPage } from '@stencil/core/testing'

describe('mds-table', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-table></mds-table>')

    const element = await page.find('mds-table')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
