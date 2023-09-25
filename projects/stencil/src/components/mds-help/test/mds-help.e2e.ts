import { newE2EPage } from '@stencil/core/testing'

describe('mds-help', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-help></mds-help>')

    const element = await page.find('mds-help')
    expect(element).toHaveAttribute('hydrated')
  })
})
