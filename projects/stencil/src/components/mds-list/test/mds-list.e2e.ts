import { newE2EPage } from '@stencil/core/testing'

describe('mds-list', () => {
  it('renders', async() => {
    const page = await newE2EPage()
    await page.setContent('<mds-list></mds-list>')

    const element = await page.find('mds-list')
    expect(element).toHaveClass('hydrated')
  })
})
