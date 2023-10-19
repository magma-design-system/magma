import { newE2EPage } from '@stencil/core/testing'

describe('mds-card-header', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-card-header></mds-card-header>')

    const element = await page.find('mds-card-header')
    expect(element).toHaveAttribute('hydrated')
  })
})
