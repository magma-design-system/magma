import { newE2EPage } from '@stencil/core/testing'

describe('mds-disclaimer-ai', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-disclaimer-ai></mds-disclaimer-ai>')

    const element = await page.find('mds-disclaimer-ai')
    expect(element).toHaveAttribute('hydrated')
  })
})
