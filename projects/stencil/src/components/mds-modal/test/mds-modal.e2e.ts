import { newE2EPage } from '@stencil/core/testing'

describe('mds-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-modal></mds-modal>')

    const element = await page.find('mds-modal')
    expect(element).toHaveClass('hydrated')
  })
})
