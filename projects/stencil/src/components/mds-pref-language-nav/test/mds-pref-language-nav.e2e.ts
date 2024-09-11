import { newE2EPage } from '@stencil/core/testing'

describe('mds-pref-language-nav', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-pref-language-nav></mds-pref-language-nav>')

    const element = await page.find('mds-pref-language-nav')
    expect(element).toHaveAttribute('hydrated')
  })
})
