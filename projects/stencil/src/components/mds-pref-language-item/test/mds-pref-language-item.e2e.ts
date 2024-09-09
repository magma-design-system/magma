import { newE2EPage } from '@stencil/core/testing'

describe('mds-pref-language-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-pref-language-item></mds-pref-language-item>')

    const element = await page.find('mds-pref-language-item')
    expect(element).toHaveClass('hydrated')
  })
})
