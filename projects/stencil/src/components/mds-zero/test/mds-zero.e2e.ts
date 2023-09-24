import { newE2EPage } from '@stencil/core/testing'

describe('mds-zero', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-zero></mds-zero>')

    const element = await page.find('mds-zero')
    expect(element).toHaveClass('hydrated')
  })
})
