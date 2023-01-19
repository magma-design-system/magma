import { newE2EPage } from '@stencil/core/testing'

describe('mds-filter', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-filter></mds-filter>')

    const element = await page.find('mds-filter')
    expect(element).toHaveAttribute('hydrated')
  })
})
