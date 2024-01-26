import { newE2EPage } from '@stencil/core/testing'

describe('mds-file-preview', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-file-preview></mds-file-preview>')

    const element = await page.find('mds-file-preview')
    expect(element).toHaveClass('hydrated')
  })
})
