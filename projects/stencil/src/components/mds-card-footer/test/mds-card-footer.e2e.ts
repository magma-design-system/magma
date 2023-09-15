import { newE2EPage } from '@stencil/core/testing'

describe('mds-card-footer', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-card-footer></mds-card-footer>')

    const element = await page.find('mds-card-footer')
    expect(element).toHaveAttribute('hydrated')
  })
})
