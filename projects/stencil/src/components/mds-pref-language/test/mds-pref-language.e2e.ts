import { newE2EPage } from '@stencil/core/testing'

describe('mds-pref-language', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-pref-language></mds-pref-language>')

    const element = await page.find('mds-pref-language')
    expect(element).toHaveAttribute('hydrated')
  })
})
