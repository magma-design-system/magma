import { newE2EPage } from '@stencil/core/testing'

describe('mds-radial-menu', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-radial-menu></mds-radial-menu>')

    const element = await page.find('mds-radial-menu')
    expect(element).toHaveAttribute('hydrated')
  })
})
