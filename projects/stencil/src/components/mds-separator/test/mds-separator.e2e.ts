import { newE2EPage } from '@stencil/core/testing'

describe('mds-separator', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-separator></mds-separator>')

    const element = await page.find('mds-separator')
    expect(element).toHaveClass('hydrated')
  })
})
