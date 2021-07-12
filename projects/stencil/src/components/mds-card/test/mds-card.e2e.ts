import { newE2EPage } from '@stencil/core/testing'

describe('mds-card', () => {
  it('renders', async() => {
    const page = await newE2EPage()
    await page.setContent('<mds-card></mds-card>')

    const element = await page.find('mds-card')
    expect(element).toHaveClass('hydrated')
  })
})
