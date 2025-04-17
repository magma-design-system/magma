import { newE2EPage } from '@stencil/core/testing'

describe('mds-radial-menu-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-radial-menu-item></mds-radial-menu-item>')

    const element = await page.find('mds-radial-menu-item')
    expect(element).toHaveAttribute('hydrated')
  })
})
