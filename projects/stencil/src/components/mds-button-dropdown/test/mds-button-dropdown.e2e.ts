import { newE2EPage } from '@stencil/core/testing'

describe('mds-button-dropdown', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-button-dropdown></mds-button-dropdown>')

    const element = await page.find('mds-button-dropdown')
    expect(element).toHaveAttribute('hydrated')
  })
})
