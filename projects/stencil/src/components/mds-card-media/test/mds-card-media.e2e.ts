import { newE2EPage } from '@stencil/core/testing'

describe('mds-card-media', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-card-media></mds-card-media>')

    const element = await page.find('mds-card-media')
    expect(element).toHaveClass('hydrated')
  })
})
