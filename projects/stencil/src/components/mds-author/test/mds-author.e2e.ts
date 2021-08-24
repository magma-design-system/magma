import { newE2EPage } from '@stencil/core/testing'

describe('mds-author', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-author></mds-author>')

    const element = await page.find('mds-author')
    expect(element).toHaveClass('hydrated')
  })
})
