import { newE2EPage } from '@stencil/core/testing'

describe('mds-bibliography', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-bibliography></mds-bibliography>')

    const element = await page.find('mds-bibliography')
    expect(element).toHaveClass('hydrated')
  })
})
