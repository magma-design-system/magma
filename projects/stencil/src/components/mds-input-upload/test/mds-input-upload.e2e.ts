import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-upload', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-upload></mds-input-upload>')

    const element = await page.find('mds-input-upload')
    expect(element).toHaveClass('hydrated')
  })
})
