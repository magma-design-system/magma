import { newE2EPage } from '@stencil/core/testing'

describe('mds-mention', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-mention></mds-mention>')

    const element = await page.find('mds-mention')
    expect(element).toHaveAttribute('hydrated')
  })
})
