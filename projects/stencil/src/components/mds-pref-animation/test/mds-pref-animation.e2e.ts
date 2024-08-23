import { newE2EPage } from '@stencil/core/testing'

describe('mds-pref-animation', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-pref-animation></mds-pref-animation>')

    const element = await page.find('mds-pref-animation')
    expect(element).toHaveAttribute('hydrated')
  })
})
