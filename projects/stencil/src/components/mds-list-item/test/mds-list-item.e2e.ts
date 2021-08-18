import { newE2EPage } from '@stencil/core/testing'

describe('mds-list-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-list-item></mds-list-item>')

    const element = await page.find('mds-list-item')
    expect(element).toHaveClass('hydrated')
  })
})
