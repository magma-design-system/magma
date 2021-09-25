import { newE2EPage } from '@stencil/core/testing'

describe('mds-url-view', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-url-view></mds-url-view>')

    const element = await page.find('mds-url-view')
    expect(element).toHaveClass('hydrated')
  })
})
