import { newE2EPage } from '@stencil/core/testing'

describe('mds-text', () => {
  it('renders', async() => {
    const page = await newE2EPage()
    await page.setContent('<mds-text></mds-text>')

    const element = await page.find('mds-text')
    expect(element).toHaveClass('hydrated')
  })
})
